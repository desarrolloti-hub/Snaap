/**
 * Componente: Tables.js (Ultra-Wide Perfect Mobile Alignment Edition)
 * Características: Ancho expandido al 95%, iconos Azules -> Rosa en Hover.
 * Corrección: El icono de basura (trash) ahora se alinea perfectamente a la derecha con los demás en móvil.
 */

const SnaapTablesComponent = (() => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :root {
            --azul-neon: #0047AB;
            --rosa-neon: #FF007A;
            --azul-claro: #4db8ff;
            --glass-bg: rgba(10, 10, 15, 0.7);
            --azul-tabla-dark: rgba(0, 43, 128, 0.4);
            --azul-tabla-light: rgba(0, 64, 153, 0.4);
        }

        /* --- CONTENEDOR EXPANDIDO --- */
        .snaap-tables-section {
            width: 95%;
            max-width: 1800px;
            margin: 40px auto;
            padding: 20px 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
            color: #ffffff;
        }

        /* --- BOTONES SUPERIORES --- */
        .tables-header-actions {
            display: flex;
            justify-content: flex-start;
            gap: 20px;
            margin-bottom: 35px;
            flex-wrap: wrap;
            padding: 0 10px;
        }

        .btn-status-counter {
            display: flex;
            align-items: center;
            background: linear-gradient(90deg, #001f5c, #0047AB);
            border: 2px solid rgba(0, 71, 171, 0.6);
            border-radius: 50px;
            overflow: hidden;
            box-shadow: 0 0 15px rgba(0, 71, 171, 0.4);
        }

        .btn-status-counter .status-text {
            padding: 10px 25px;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .btn-status-counter .status-count {
            background: #001133;
            padding: 10px 20px;
            font-weight: 800;
            font-size: 16px;
            border-left: 2px solid var(--azul-claro);
            color: #ffffff;
            min-width: 30px;
            text-align: center;
            text-shadow: 0 0 8px var(--azul-claro);
        }

        .btn-add-data {
            display: flex;
            align-items: center;
            gap: 12px;
            background: transparent;
            border: 2px solid var(--azul-neon);
            padding: 10px 25px;
            border-radius: 50px;
            color: #fff;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(0, 71, 171, 0.3);
            animation: tableNeonPulse 2.5s infinite alternate;
        }

        .btn-add-data i {
            font-size: 16px;
            padding-right: 12px;
            border-right: 1.5px solid rgba(255,255,255,0.3);
            color: var(--azul-claro);
        }

        .btn-add-data:hover {
            border-color: var(--rosa-neon);
            box-shadow: 0 0 25px var(--rosa-neon), inset 0 0 8px var(--rosa-neon);
            transform: translateY(-3px);
            color: #fff;
        }

        /* --- DISEÑO DE LA TABLA (ESCRITORIO) --- */
        .snaap-table-wrapper {
            width: 100%;
            overflow-x: auto;
            padding: 10px;
        }

        .snaap-custom-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 16px;
            text-align: left;
            table-layout: fixed;
        }

        .snaap-custom-table th, 
        .snaap-custom-table td {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .snaap-custom-table th {
            padding: 20px 25px;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            background: rgba(0, 43, 128, 0.5);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .snaap-custom-table th:first-child { border-radius: 20px 0 0 20px; border-left: 1px solid rgba(255,255,255,0.1); }
        .snaap-custom-table th:last-child { border-radius: 0 20px 20px 0; border-right: 1px solid rgba(255,255,255,0.1); }

        .snaap-custom-table tbody tr {
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            box-shadow: 0 0 8px rgba(0, 71, 171, 0.2);
        }

        .snaap-custom-table tbody tr:nth-child(odd) td { background: var(--azul-tabla-dark); }
        .snaap-custom-table tbody tr:nth-child(even) td { background: var(--azul-tabla-light); }

        .snaap-custom-table td {
            padding: 20px 25px;
            font-size: 15px;
            font-weight: 400;
            vertical-align: middle;
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-top: 2px solid var(--azul-neon);
            border-bottom: 2px solid var(--azul-neon);
            transition: all 0.4s ease;
        }

        .snaap-custom-table tbody tr td:first-child { 
            border-radius: 50px 0 0 50px; 
            border-left: 2px solid var(--azul-neon); 
        }
        .snaap-custom-table tbody tr td:last-child { 
            border-radius: 0 50px 50px 0; 
            border-right: 2px solid var(--azul-neon); 
        }

        .snaap-custom-table th:not(:last-child),
        .snaap-custom-table td:not(:last-child) {
            border-right: 2px solid var(--azul-claro);
        }

        /* --- HOVER FILA COMPLETA --- */
        .snaap-custom-table tbody tr:hover td {
            border-color: var(--rosa-neon);
        }
        
        .snaap-custom-table tbody tr:hover {
            transform: translateY(-3px) scale(1.005);
            filter: drop-shadow(0 5px 15px rgba(255, 0, 122, 0.4));
        }

        /* --- ICONOS DE ACCIONES (AZUL A ROSA) --- */
        .action-icon-btn {
            background: transparent;
            border: none;
            color: var(--azul-claro);
            font-size: 19px;
            cursor: pointer;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 4px var(--azul-neon));
        }

        .snaap-custom-table tbody tr:hover .action-icon-btn {
            color: var(--rosa-neon);
            filter: drop-shadow(0 0 6px var(--rosa-neon));
        }

        .action-icon-btn:hover {
            transform: scale(1.3);
            color: #ffffff !important;
            filter: drop-shadow(0 0 10px var(--rosa-neon)) !important;
        }

        @keyframes tableNeonPulse {
            from { box-shadow: 0 0 5px var(--azul-neon); border-color: var(--azul-neon); }
            to { box-shadow: 0 0 15px var(--azul-neon); border-color: var(--azul-claro); }
        }

        /* ========================================================
           MODO RESPONSIVE (MÓVIL A TARJETAS PERFECTO)
           ======================================================== */
        @media (max-width: 768px) {
            .snaap-tables-section { width: 90%; }
            .tables-header-actions { justify-content: center; }

            .snaap-custom-table, 
            .snaap-custom-table thead, 
            .snaap-custom-table tbody, 
            .snaap-custom-table th, 
            .snaap-custom-table tr { 
                display: block; 
                table-layout: auto;
            }

            .snaap-custom-table td {
                display: block;
            }
            
            .snaap-custom-table thead { display: none; }

            /* Tarjeta Base */
            .snaap-custom-table tbody tr {
                margin-bottom: 25px;
                background: rgba(10, 10, 15, 0.85) !important;
                border: 2px solid var(--azul-neon);
                border-radius: 24px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                box-sizing: border-box;
            }

            /* Forzamos a que TODOS las celdas de datos queden alineadas */
            .snaap-custom-table tbody tr td {
                background: transparent !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 12px 0 !important;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                white-space: normal;
            }

            /* PARCHE: Agrupamos las últimas celdas de iconos en una sola línea a la derecha */
            .snaap-custom-table tbody tr td:nth-last-child(3),
            .snaap-custom-table tbody tr td:nth-last-child(2) {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                justify-content: flex-end; /* Alineados a la derecha con los datos */
            }

            .snaap-custom-table tbody tr td:last-child {
                border-bottom: none !important;
                justify-content: flex-end; /* El bote de basura ahora muere a la derecha */
                padding-top: 12px !important;
            }

            .snaap-custom-table tbody tr:hover {
                border-color: var(--rosa-neon);
                filter: drop-shadow(0 0 15px rgba(255, 0, 122, 0.5));
                transform: translateY(-4px);
            }

            /* Texto descriptivo a la izquierda */
            .snaap-custom-table tbody tr td::before {
                content: attr(data-label);
                font-weight: 700;
                color: var(--azul-claro);
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
                text-shadow: 0 0 5px rgba(77, 184, 255, 0.3);
            }
        }
    `;

    const tableData = [
        { col1: "Dato Registro 1", col2: "Dato Categoría A", col3: "Dato Procesado", col4: "Activo" },
        { col1: "Dato Registro 2", col2: "Dato Categoría B", col3: "Dato Pendiente", col4: "Inactivo" },
        { col1: "Dato Registro 3", col2: "Dato Categoría A", col3: "Dato Procesado", col4: "Activo" },
        { col1: "Dato Registro 4", col2: "Dato Categoría C", col3: "Dato Cancelado", col4: "Inactivo" },
        { col1: "Dato Registro 5", col2: "Dato Categoría B", col3: "Dato Procesado", col4: "Activo" },
        { col1: "Dato Registro 6", col2: "Dato Categoría A", col3: "Dato Pendiente", col4: "Activo" },
        { col1: "Dato Registro 7", col2: "Dato Categoría C", col3: "Dato Procesado", col4: "Inactivo" },
        { col1: "Dato Registro 8", col2: "Dato Categoría B", col3: "Dato Procesado", col4: "Activo" }
    ];

    const init = () => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const target = document.getElementById("contenedor-tablas");
        if (!target) return;

        const container = document.createElement("div");
        container.className = "snaap-tables-section";

        container.innerHTML = `
            <div class="tables-header-actions">
                <div class="btn-status-counter">
                    <div class="status-text">Datos</div>
                    <div class="status-count">08</div>
                </div>
                <button class="btn-add-data">
                    <i class="fas fa-plus"></i>Agregar datos
                </button>
            </div>

            <div class="snaap-table-wrapper">
                <table class="snaap-custom-table">
                    <thead>
                        <tr>
                            <th>Datos</th>
                            <th>Datos</th>
                            <th>Datos</th>
                            <th>Datos</th>
                            <th style="text-align: center; width: 60px;">Icon</th>
                            <th style="text-align: center; width: 60px;">Icon</th>
                            <th style="text-align: center; width: 60px;">Icon</th>
                        </tr>
                    </thead>
                    <tbody id="snaap-tbody-data"></tbody>
                </table>
            </div>
        `;

        target.appendChild(container);
        renderRows();
    };

    const renderRows = () => {
        const tbody = document.getElementById("snaap-tbody-data");
        tbody.innerHTML = "";

        tableData.forEach((row) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="Datos">${row.col1}</td>
                <td data-label="Datos">${row.col2}</td>
                <td data-label="Datos">${row.col3}</td>
                <td data-label="Datos">${row.col4}</td>
                <td data-label="Icon" style="text-align: center;"><button class="action-icon-btn"><i class="fas fa-eye"></i></button></td>
                <td data-label="Icon" style="text-align: center;"><button class="action-icon-btn"><i class="fas fa-pen-to-square"></i></button></td>
                <td data-label="Icon" style="text-align: center;"><button class="action-icon-btn"><i class="fas fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", SnaapTablesComponent.init);