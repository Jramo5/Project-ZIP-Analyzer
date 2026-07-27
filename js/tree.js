import { escapeHtml } from './utils.js';

/**
 * Renderiza el árbol en el contenedor
 */
export function renderTree(container, treeData) {
    if (!treeData || !treeData.children) {
        container.innerHTML = '<p class="text-secondary">No hay datos para mostrar.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'tree-root';
    ul.style.listStyle = 'none';
    ul.style.paddingLeft = '0';

    // Construir recursivamente
    buildTreeNodes(treeData.children, ul);

    container.innerHTML = '';
    container.appendChild(ul);

    // Añadir eventos de clic para expandir/contraer
    container.querySelectorAll('.tree-toggle').forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            const li = this.closest('li');
            const childList = li.querySelector('ul');
            if (childList) {
                const isHidden = childList.style.display === 'none';
                childList.style.display = isHidden ? '' : 'none';
                const icon = this.querySelector('.bi');
                if (icon) {
                    icon.classList.toggle('bi-chevron-right', !isHidden);
                    icon.classList.toggle('bi-chevron-down', isHidden);
                }
            }
        });
    });
}

/**
 * Función recursiva para construir nodos
 */
function buildTreeNodes(children, parentUl) {
    for (const child of children) {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '4px';
        div.style.cursor = 'default';
        div.style.padding = '2px 4px';
        div.style.borderRadius = '4px';
        div.style.width = '100%';

        // Icono de chevron si tiene hijos
        const hasChildren = child.children && child.children.length > 0;
        const chevron = document.createElement('span');
        chevron.className = 'tree-toggle bi bi-chevron-right';
        chevron.style.fontSize = '0.7rem';
        chevron.style.width = '16px';
        chevron.style.display = 'inline-block';
        chevron.style.cursor = 'pointer';
        if (!hasChildren) {
            chevron.style.visibility = 'hidden';
        }
        div.appendChild(chevron);

        // Icono de carpeta o archivo
        const icon = document.createElement('i');
        if (child.type === 'folder') {
            icon.className = 'bi bi-folder-fill text-warning';
            icon.style.marginRight = '4px';
        } else {
            icon.className = 'bi bi-file-earmark text-primary';
            icon.style.marginRight = '4px';
        }
        div.appendChild(icon);

        // Nombre
        const nameSpan = document.createElement('span');
        nameSpan.textContent = child.name;
        if (child.type === 'file') {
            nameSpan.style.color = '#e2e8f0';
            if (child.size !== undefined) {
                const sizeInfo = document.createElement('span');
                sizeInfo.className = 'text-secondary ms-2';
                sizeInfo.style.fontSize = '0.7rem';
                sizeInfo.textContent = `(${formatBytes(child.size)})`;
                div.appendChild(sizeInfo);
            }
        } else {
            nameSpan.style.color = '#fbbf24';
        }
        div.appendChild(nameSpan);

        li.appendChild(div);

        // Hijos
        if (hasChildren) {
            const childUl = document.createElement('ul');
            childUl.style.listStyle = 'none';
            childUl.style.paddingLeft = '1.5rem';
            childUl.style.display = 'block';
            buildTreeNodes(child.children, childUl);
            li.appendChild(childUl);
        }

        parentUl.appendChild(li);
    }
}

/**
 * Helper para formatear bytes (copiado de utils para no importar)
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}