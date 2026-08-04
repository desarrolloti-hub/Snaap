// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// ============================================
// 📤 ENVIAR NOTIFICACIÓN FCM A UN USUARIO
// ============================================
exports.sendNotificationToUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
    }

    const { title, body, icon, link, userId } = data;

    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'Se requiere userId');
    }

    try {
        const tokensSnapshot = await admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('devices')
            .where('active', '==', true)
            .get();

        if (tokensSnapshot.empty) {
            console.log(`⚠️ No hay tokens activos para el usuario ${userId}`);
            return { success: false, message: 'No hay dispositivos activos' };
        }

        const tokens = [];
        tokensSnapshot.forEach(doc => {
            tokens.push(doc.data().token);
        });

        console.log(`📤 Enviando notificación a ${tokens.length} dispositivos`);

        const message = {
            notification: {
                title: title || 'SNAAP',
                body: body || 'Tienes una nueva notificación'
            },
            data: {
                link: link || '/',
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`✅ Notificación enviada: ${response.successCount} exitosos, ${response.failureCount} fallidos`);

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };

    } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ============================================
// 📤 ENVIAR NOTIFICACIÓN A MÚLTIPLES USUARIOS
// ============================================
exports.sendNotificationToMultipleUsers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
    }

    const { title, body, icon, link, userIds } = data;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Se requiere un array de userIds');
    }

    try {
        let allTokens = [];

        for (const userId of userIds) {
            const tokensSnapshot = await admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('devices')
                .where('active', '==', true)
                .get();

            tokensSnapshot.forEach(doc => {
                allTokens.push(doc.data().token);
            });
        }

        if (allTokens.length === 0) {
            return { success: false, message: 'No hay dispositivos activos' };
        }

        console.log(`📤 Enviando notificación a ${allTokens.length} dispositivos`);

        const chunkSize = 500;
        let totalSuccess = 0;
        let totalFailure = 0;

        for (let i = 0; i < allTokens.length; i += chunkSize) {
            const chunk = allTokens.slice(i, i + chunkSize);
            
            const message = {
                notification: {
                    title: title || 'SNAAP',
                    body: body || 'Tienes una nueva notificación'
                },
                data: {
                    link: link || '/',
                    click_action: 'FLUTTER_NOTIFICATION_CLICK'
                },
                tokens: chunk
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            totalSuccess += response.successCount;
            totalFailure += response.failureCount;
        }

        return {
            success: true,
            successCount: totalSuccess,
            failureCount: totalFailure
        };

    } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ============================================
// 🔔 NOTIFICACIÓN CUANDO SE CREA UN HOST
// ============================================
exports.onHostCreated = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userData = snap.data();
        
        // Solo si el rol es 'host'
        if (userData.role !== 'host') return;

        console.log(`👤 Nuevo host creado: ${userData.username} (${userData.email})`);

        // Obtener todos los sysadmins
        const adminsSnapshot = await admin.firestore()
            .collection('users')
            .where('role', '==', 'sysadmin')
            .get();

        const adminIds = [];
        adminsSnapshot.forEach(doc => {
            adminIds.push(doc.id);
        });

        if (adminIds.length === 0) return;

        // Obtener tokens de los sysadmins
        let allTokens = [];
        for (const adminId of adminIds) {
            const tokensSnapshot = await admin.firestore()
                .collection('users')
                .doc(adminId)
                .collection('devices')
                .where('active', '==', true)
                .get();

            tokensSnapshot.forEach(doc => {
                allTokens.push(doc.data().token);
            });
        }

        if (allTokens.length === 0) return;

        // Enviar notificación
        const message = {
            notification: {
                title: '👤 Nuevo Host registrado',
                body: `El host "${userData.username}" (${userData.email}) se ha registrado en la plataforma.`
            },
            data: {
                link: '/sysadmin/hosts',
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            tokens: allTokens
        };

        await admin.messaging().sendEachForMulticast(message);
        console.log(`✅ Notificación de nuevo host enviada a ${allTokens.length} dispositivos`);
    });

console.log('🚀 Cloud Functions de SNAAP cargadas correctamente');