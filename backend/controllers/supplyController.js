const { Supply, User } = require('../models');

// Get all supplies (with supplier details)
exports.getAllSupplies = async (whereClause = {}, order = [['createdAt', 'DESC']]) => {
  return Supply.findAll({
    where: whereClause,
    include: [{ model: User, as: 'supplier', attributes: ['id', 'name', 'email', 'phone'] }],
    order
  });
};

// Get supply by ID (with supplier details)
exports.getSupplyById = async (id) => {
  return Supply.findByPk(id, {
    include: [{ model: User, as: 'supplier', attributes: ['id', 'name', 'email', 'phone'] }]
  });
};

// Update supply by ID (admin or owner)
exports.updateSupply = async (id, user, updateData) => {
  const supply = await Supply.findByPk(id);
  if (!supply) return { error: 'Supply not found', status: 404 };
  if (supply.supplierId !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to update this supply', status: 403 };
  }
  await supply.update(updateData);
  return { supply };
};

// Delete supply by ID (admin or owner)
exports.deleteSupply = async (id, user) => {
  const supply = await Supply.findByPk(id);
  if (!supply) return { error: 'Supply not found', status: 404 };
  if (supply.supplierId !== user.id && user.role !== 'admin') {
    return { error: 'Not authorized to delete this supply', status: 403 };
  }
  await supply.destroy();
  return { message: 'Supply deleted successfully' };
}; 