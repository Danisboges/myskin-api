const userManagementService = require('../services/userManagement.service');

const fetchAllUsers = async (req, res) => {
  try {
    console.log("Mencoba fetch semua user oleh Admin");
    const users = await userManagementService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("Gagal fetch users:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const fetchAllPatients = async (req, res) => {
  try {
    console.log("Mencoba fetch semua pasien");
    
    // Memanggil service yang baru saja dibuat
    const patient = await userManagementService.getAllPatients();
    
    // Mengembalikan response sukses (disarankan menggunakan format JSON yang terstruktur)
    res.status(200).json({
      success: true,
      message: "Data pasien berhasil diambil",
      data: patient
    });
  } catch (err) {
    console.error("Gagal fetch patients:", err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

const fetchAllDoctors = async (req, res) => {
  try {
    console.log("Mencoba fetch semua dokter oleh Admin");
    const doctors = await userManagementService.getAllDoctors();
    res.status(200).json(doctors);
  } catch (err) {
    console.error("Gagal fetch doctors:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const fetchUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Mencoba fetch detail user ID: ${id}`);
    const user = await userManagementService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ 
        status: "error", 
        message: "User tidak ditemukan" 
      });
    }

    res.status(200).json({
      status: "success",
      data: user
    });
  } catch (err) {
    console.error("Gagal fetch detail user:", err.message);
    res.status(404).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// const changeRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body;
//     console.log(`Mencoba ubah role user ID: ${id} menjadi ${role}`);

//     // Validasi sederhana
//     if (!["admin", "doctor", "patient"].includes(role)) {
//       return res.status(400).json({ error: "Role tidak valid" });
//     }

//     const updatedUser = await userManagementService.updateUserRole(id, role);
//     res.status(200).json({ message: "Role berhasil diupdate", data: updatedUser });
//   } catch (err) {
//     console.error("Gagal ubah role:", err.message);
//     res.status(400).json({ error: err.message });
//   }
// };

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    console.log(`Mencoba update user ID: ${id} dengan nama: ${name}, email: ${email}, role: ${role}`);

    const updatedUser = await userManagementService.updateUser(id, { name, email, role });
    res.status(200).json({ message: "User berhasil diupdate", data: updatedUser });
  } catch (err) {
    console.error("Gagal update user:", err.message);
    res.status(400).json({ error: err.message });
  }
};


const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Mencoba hapus user ID: ${id}`);
    await userManagementService.deleteUserAccount(id);
    res.status(200).json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus user:", err.message);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { fetchAllUsers, fetchAllPatients, fetchAllDoctors, fetchUserDetail, removeUser, updateUser };