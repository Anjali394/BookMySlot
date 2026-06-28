const repo = require('../repositories/provider.repository');
const ApiError = require('../utils/ApiError');

const registerBusiness = async (userId, { bio, businessName, category, phone, address }) => {
  const existing = await repo.findProviderByUserId(userId);
  if (existing) throw ApiError.conflict('Provider profile already exists');

  return repo.createProviderWithBusiness(
    userId,
    { bio },
    { name: businessName, category, phone, address }
  );
};

const getMyProfile = async (userId) => {
  const provider = await repo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found');
  return provider;
};

const updateMyProfile = async (userId, data) => {
  const provider = await repo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found');
  return repo.updateProvider(provider.id, data);
};

const updateMyBusiness = async (userId, data) => {
  const provider = await repo.findProviderByUserId(userId);
  if (!provider) throw ApiError.notFound('Provider profile not found');
  if (!provider.business) throw ApiError.notFound('Business not found');
  return repo.updateBusiness(provider.id, data);
};

const getProviderById = async (id) => {
  const provider = await repo.findProviderById(id);
  if (!provider) throw ApiError.notFound('Provider not found');
  return provider;
};

const listProviders = async ({ category, search, page = 1, limit = 10 }) => {
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const [providers, total] = await Promise.all([
    repo.listProviders({ category, search, skip, take }),
    repo.countProviders({ category, search }),
  ]);

  return {
    providers,
    pagination: {
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

module.exports = {
  registerBusiness,
  getMyProfile,
  updateMyProfile,
  updateMyBusiness,
  getProviderById,
  listProviders,
};
