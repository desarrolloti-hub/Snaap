export const tablesController = {
    render(container) {
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
        
        const wrapper = document.createElement('div');
        wrapper.className = "snaap-tables-section";
        wrapper.innerHTML = `
            <div class="tables-header-actions">
                <div class="btn-status-counter"><div class="status-text">Datos</div><div class="status-count">08</div></div>
                <button class="btn-add-data"><i class="fas fa-plus"></i>Agregar datos</button>
            </div>
            <div class="snaap-table-wrapper">
                <table class="snaap-custom-table">
                    <thead><tr><th>Datos</th><th>Datos</th><th>Datos</th><th>Datos</th><th>Icon</th><th>Icon</th><th>Icon</th></tr></thead>
                    <tbody id="snaap-tbody-data"></tbody>
                </table>
            </div>
        `;
        
        const tbody = wrapper.querySelector('#snaap-tbody-data');
        tableData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Datos">${row.col1}</td>
                <td data-label="Datos">${row.col2}</td>
                <td data-label="Datos">${row.col3}</td>
                <td data-label="Datos">${row.col4}</td>
                <td data-label="Icon"><button class="action-icon-btn"><i class="fas fa-eye"></i></button></td>
                <td data-label="Icon"><button class="action-icon-btn"><i class="fas fa-pen-to-square"></i></button></td>
                <td data-label="Icon"><button class="action-icon-btn"><i class="fas fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
        
        container.innerHTML = '';
        container.appendChild(wrapper);
        
        wrapper.querySelectorAll('.action-icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Acción de tabla');
                alert('Función en desarrollo');
            });
        });
        
        const addBtn = wrapper.querySelector('.btn-add-data');
        if (addBtn) addBtn.addEventListener('click', () => alert('Agregar datos en desarrollo'));
    }
};