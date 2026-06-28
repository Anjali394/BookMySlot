const prisma = require('../config/db');

const findProviderByUserId = (userId) =>
  prisma.provider.findUnique({
    where: { userId },
    include: { business: true, user: { select: { id: true, name: true, email: true } } },
  });

const findProviderById = (id) =>
  prisma.provider.findUnique({
    where: { id },
    include: { business: true, user: { select: { id: true, name: true, email: true } } },
  });

const createProviderWithBusiness = (userId, providerData, businessData) =>
  prisma.$transaction([
    prisma.provider.create({
      data: {
        userId,
        bio: providerData.bio,
        business: { create: businessData },
      },
      include: { business: true, user: { select: { id: true, name: true, email: true } } },
    }),
  ]).then((results) => results[0]);

const updateProvider = (id, data) =>
  prisma.provider.update({
    where: { id },
    data,
    include: { business: true, user: { select: { id: true, name: true, email: true } } },
  });

const updateBusiness = (providerId, data) =>
  prisma.business.update({
    where: { providerId },
    data,
  });

const listProviders = ({ category, search, skip, take }) =>
  prisma.provider.findMany({
    where: {
      user: { isActive: true },
      ...(category && { business: { category: { contains: category, mode: 'insensitive' } } }),
      ...(search && {
        OR: [
          { business: { name: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      business: true,
      user: { select: { id: true, name: true, email: true } },
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

const countProviders = ({ category, search }) =>
  prisma.provider.count({
    where: {
      user: { isActive: true },
      ...(category && { business: { category: { contains: category, mode: 'insensitive' } } }),
      ...(search && {
        OR: [
          { business: { name: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    },
  });

module.exports = {
  findProviderByUserId,
  findProviderById,
  createProviderWithBusiness,
  updateProvider,
  updateBusiness,
  listProviders,
  countProviders,
};
