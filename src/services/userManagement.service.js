const prisma = require("../config/prisma"); // Sesuaikan path jika berbeda

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllPatients = async () => {
  return await prisma.user.findMany({
    where: {
      role: "patient" // Sekarang huruf kecil PASTI berhasil
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllDoctors = async () => {
  return await prisma.user.findMany({
    where: {
      role: "doctor" // Pastikan sudah sama dengan yang di schema
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      detections: true,
      patientConsultations: true,
      doctorConsultations: true,
    },
  });
};

const updateUser = async (id, userData) => {
  return await prisma.user.update({
    where: { id },
    data: userData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  });
};

const deleteUserAccount = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

module.exports = { getAllUsers, getAllPatients, getAllDoctors, getUserById, updateUser, deleteUserAccount };