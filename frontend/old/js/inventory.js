// ============================================
// Inventory Management
// ============================================

let inventory = [];

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadInventory();
    setupEventListeners();
});

// ============================================
// Load Data
// ============================================

async function loadInventory() {
    try {
        const data = await apiCall('/api/photocopy/products');
        inventory = data.products.filter(p => p.is_service === false); // Only products
        renderInventory();
    } catch (error) {
        console.error('Error loading inventory:', error);
        showNotification('Failed to load inventory', 'error');
    }
}

// ============================================
// Render Functions
// ============================================

function renderInventory() {
    const list = document.getElementById('inventoryList');

    if (inventory.length === 0) {
        list.innerHTML = '<p class="text-center text-gray">No inventory items found</p>';
        return;
    }

    list.innerHTML = inventory.map(item => `
        <div class="inventory-item ${item.stock <= 10 ? 'low-stock' : ''}">
            <div class="inventory-info">
                <h3>${item.name}</h3>
                <p>${item.category || 'No category'} | ${formatCurrency(item.price)}</p>
            </div>
            <div class="inventory-stock">
                <div class="stock-value ${item.stock <= 10 ? 'stock-low' : ''}">
                    ${item.stock || 0} in stock
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', function() {
        document.getElementById('addItemModal').style.display = 'flex';
    });

    // Add category button
    document.getElementById('addCategoryBtn').addEventListener('click', function() {
        document.getElementById('addCategoryModal').style.display = 'flex';
    });

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Add item form
    document.getElementById('addItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const itemData = {
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            type: document.getElementById('itemType').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            cost: parseFloat(document.getElementById('itemCost').value) || 0,
            stock: parseInt(document.getElementById('itemStock').value) || 0,
            low_stock_threshold: parseInt(document.getElementById('itemLowStock').value) || 10,
        };

        try {
            const result = await apiCall('/api/photocopy/inventory/add', 'POST', itemData);
            showNotification('Item added successfully');
            document.getElementById('addItemModal').style.display = 'none';
            document.getElementById('addItemForm').reset();
            await loadInventory();
        } catch (error) {
            console.error('Error adding item:', error);
            showNotification('Failed to add item', 'error');
        }
    });

    // Add category form
    document.getElementById('addCategoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('categoryName').value;
        const pricing = document.getElementById('categoryPricing').value;

        try {
            // Add the new category to the dropdown
            const select = document.getElementById('itemCategory');
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);

            showNotification('Category added successfully');
            document.getElementById('addCategoryModal').style.display = 'none';
            document.getElementById('addCategoryForm').reset();
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification('Failed to add category', 'error');
        }
    });
}
