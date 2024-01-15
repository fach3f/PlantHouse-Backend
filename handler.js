const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createConnection = require("./dbhandler");

const register = async (request, h) => {
    try {
        const { fullName, username, password } = request.payload;
        const db = await createConnection();

        // Check if the table exists, create it if not
        await db.execute(`
            CREATE TABLE IF NOT EXISTS login (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Check if username is already registered
        const [usernameRows] = await db.execute("SELECT * FROM login WHERE username = ?", [username]);
        if (usernameRows.length > 0) {
            return h.response({
                status: "Error",
                message: "Username sudah terdaftar, mohon gunakan username yang lain",
                code: 400,
            });
        }

        // Hash the password and insert the user into the database
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute("INSERT INTO login (full_name, username, password) VALUES (?, ?, ?)", [fullName, username, hashedPassword]);

        return h.response({
            status: "Success",
            message: "Berhasil Register",
            code: 201,
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat registrasi.",
            code: 500,
        });
    }
};


const login = async (request, h) => {
    try {
        const { username, password } = request.payload;

        if (!username || !password) {
            return h.response({
                status: "Failed",
                message: "Login gagal. Harap masukkan username dan password.",
                code: 400,
            });
        }

        const db = await createConnection();
        const [rows] = await db.execute("SELECT * FROM login WHERE username = ?", [username]);

        if (rows.length > 0) {
            const isValidPassword = await bcrypt.compare(password, rows[0].password);

            if (isValidPassword) {
                const token = jwt.sign(
                    { username: rows[0].username },
                    "rahasiakunci",
                    { expiresIn: "1h" }
                );

                return h.response({
                    status: "Success",
                    message: "Berhasil Login",
                    code: 200,
                    token: token,
                });
            } else {
                return h.response({
                    status: "Failed",
                    message: "Login gagal. Password salah.",
                    code: 401,
                });
            }
        } else {
            return h.response({
                status: "Failed",
                message: "Login gagal. Pengguna tidak ditemukan.",
                code: 401,
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat login.",
            code: 500,
        });
    }
};

const saveTemperature = async (request, h) => {
    try {
        const { temperature } = request.payload;

        if (!temperature) {
            return h.response({
                status: "Failed",
                message: "Gagal menyimpan data temperatur. Harap sertakan temperatur.",
                code: 400,
            });
        }

        const db = await createConnection();

        // Assuming you have a table named 'temperature' for storing the latest temperature data
        await db.execute(`
            CREATE TABLE IF NOT EXISTS temperature (
                id INT AUTO_INCREMENT PRIMARY KEY,
                temperature FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Delete existing data from the 'temperature' table
        await db.execute("DELETE FROM temperature");

        // Insert new temperature data into the 'temperature' table
        await db.execute("INSERT INTO temperature (temperature) VALUES (?)", [temperature]);

        // Assuming you have a table named 'total_temp' for storing all historical temperature data
        await db.execute(`
            CREATE TABLE IF NOT EXISTS total_temperature (
                id INT AUTO_INCREMENT PRIMARY KEY,
                temperature FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert new temperature data into the 'total_temp' table
        await db.execute("INSERT INTO total_temperature (temperature) VALUES (?)", [temperature]);

        return h.response({
            status: "Success",
            message: "Berhasil menyimpan data temperatur",
            code: 201,
        });
    } catch (error) {
        console.error('Error during temperature data storage:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat menyimpan data temperatur.",
            code: 500,
        });
    }
};

const getTemperatureData = async (request, h) => {
    try {
        const db = await createConnection();

        // Assuming you have a table named 'temperature' for storing the latest temperature data
        const [rows] = await db.execute("SELECT * FROM temperature ORDER BY timestamp DESC LIMIT 1");

        if (rows.length > 0) {
            const temperatureData = {
                temperature: rows[0].temperature,
                timestamp: rows[0].timestamp
            };

            return h.response({
                status: "Success",
                message: "Berhasil mendapatkan data temperatur",
                code: 200,
                data: temperatureData,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Data temperatur tidak ditemukan",
                code: 404,
            });
        }
    } catch (error) {
        console.error('Error during fetching temperature data:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data temperatur.",
            code: 500,
        });
    }
};

const savehumid = async (request, h) => {
    try {
        const { humidity } = request.payload;

        if (!humidity) {
            return h.response({
                status: "Failed",
                message: "Gagal menyimpan data humidity. Harap sertakan humidity.",
                code: 400,
            });
        }

        const db = await createConnection();

        // Assuming you have a table named 'temperature' for storing the latest temperature data
        await db.execute(`
            CREATE TABLE IF NOT EXISTS humidity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                humidity FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Delete existing data from the 'temperature' table
        await db.execute("DELETE FROM humidity");

        // Insert new temperature data into the 'temperature' table
        await db.execute("INSERT INTO humidity (humidity) VALUES (?)", [humidity]);

        // Assuming you have a table named 'total_temp' for storing all historical temperature data
        await db.execute(`
            CREATE TABLE IF NOT EXISTS total_humidity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                humidity FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert new temperature data into the 'total_temp' table
        await db.execute("INSERT INTO total_humidity (humidity) VALUES (?)", [humidity]);

        return h.response({
            status: "Success",
            message: "Berhasil menyimpan data humidity",
            code: 201,
        });
    } catch (error) {
        console.error('Error during humid data storage:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat menyimpan data humidity.",
            code: 500,
        });
    }
};

const gethumid = async (request, h) => {
    try {
        const db = await createConnection();

        // Assuming you have a table named 'temperature' for storing the latest temperature data
        const [rows] = await db.execute("SELECT * FROM humidity ORDER BY timestamp DESC LIMIT 1");

        if (rows.length > 0) {
            const humiditydata = {
                humidity: rows[0].humidity,
                timestamp: rows[0].timestamp
            };

            return h.response({
                status: "Success",
                message: "Berhasil mendapatkan data humidity",
                code: 200,
                data: humiditydata,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Data humidity tidak ditemukan",
                code: 404,
            });
        }
    } catch (error) {
        console.error('Error during fetching humidity data:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data humidity.",
            code: 500,
        });
    }
};

const gettotalhumid = async (request, h) => {
    try {
        const db = await createConnection();

        // Assuming you have a table named 'humidity' for storing humidity data
        const [rows] = await db.execute(`
            SELECT DATE(timestamp) AS date, AVG(humidity) AS avg_humidity
            FROM total_humidity
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
            LIMIT 1
        `);

        if (rows.length > 0) {
            const humidityData = {
                avg_humidity: rows[0].avg_humidity,
                date: rows[0].date
            };

            return h.response({
                status: "Success",
                message: "Berhasil mendapatkan data rata-rata humidity per hari dalam satu minggu",
                code: 200,
                data: humidityData,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Data humidity tidak ditemukan",
                code: 404,
            });
        }
    } catch (error) {
        console.error('Error during fetching humidity data:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data humidity.",
            code: 500,
        });
    }
};



const saveTurbidity = async (request, h) => {
    try {
        const { turbidity } = request.payload;

        if (!turbidity) {
            return h.response({
                status: "Failed",
                message: "Gagal menyimpan data turbidity. Harap sertakan turbidity.",
                code: 400,
            });
        }

        const db = await createConnection();

        // Assuming you have a table named 'turbidity' for storing the latest turbidity data
        await db.execute(`
            CREATE TABLE IF NOT EXISTS turbidity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                turbidity FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Delete existing data from the 'turbidity' table
        await db.execute("DELETE FROM turbidity");

        // Insert new turbidity data into the 'turbidity' table
        await db.execute("INSERT INTO turbidity (turbidity) VALUES (?)", [turbidity]);

        // Assuming you have a table named 'total_turbidity' for storing all historical turbidity data
        await db.execute(`
            CREATE TABLE IF NOT EXISTS total_turbidity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                turbidity FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert new turbidity data into the 'total_turbidity' table
        await db.execute("INSERT INTO total_turbidity (turbidity) VALUES (?)", [turbidity]);

        return h.response({
            status: "Success",
            message: "Berhasil menyimpan data turbidity",
            code: 201,
        });
    } catch (error) {
        console.error('Error during turbidity data storage:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat menyimpan data turbidity.",
            code: 500,
        });
    }
};

const getTurbidity = async (request, h) => {
    try {
        const db = await createConnection();

        // Assuming you have a table named 'turbidity' for storing the latest turbidity data
        const [rows] = await db.execute("SELECT * FROM turbidity ORDER BY timestamp DESC LIMIT 1");

        if (rows.length > 0) {
            const turbidityData = {
                turbidity: rows[0].turbidity,
                timestamp: rows[0].timestamp
            };

            return h.response({
                status: "Success",
                message: "Berhasil mendapatkan data turbidity",
                code: 200,
                data: turbidityData,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Data turbidity tidak ditemukan",
                code: 404,
            });
        }
    } catch (error) {
        console.error('Error during fetching turbidity data:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data turbidity.",
            code: 500,
        });
    }
};

const getTotalTurbidity = async (request, h) => {
    try {
        const db = await createConnection();

        // Assuming you have a table named 'total_turbidity' for storing all historical turbidity data
        const [rows] = await db.execute("SELECT * FROM total_turbidity ORDER BY timestamp DESC");

        if (rows.length > 0) {
            const turbidityData = rows.map(row => ({
                turbidity: row.turbidity,
                timestamp: row.timestamp
            }));

            return h.response({
                status: "Success",
                message: "Berhasil mendapatkan data total turbidity",
                code: 200,
                data: turbidityData,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Data total turbidity tidak ditemukan",
                code: 404,
            });
        }
    } catch (error) {
        console.error('Error during fetching total turbidity data:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data total turbidity.",
            code: 500,
        });
    }
};

const getWaterStatus = async (request, h) => {
    try {
      const db = await createConnection(); // Pastikan ada fungsi createConnection() yang mengembalikan koneksi ke database
  
      // Gantilah 'plants' dengan nama tabel yang sesuai di database Anda
      const [rows] = await db.execute("SELECT is_muddy FROM plants LIMIT 1");
  
      if (rows.length > 0) {
        const waterStatus = rows[0].is_muddy;
        return h.response({
          status: "Success",
          message: "Berhasil mendapatkan status air tanaman",
          code: 200,
          data: { waterStatus },
        });
      } else {
        return h.response({
          status: "Failed",
          message: "Tanaman tidak ditemukan",
          code: 404,
        });
      }
    } catch (error) {
      console.error('Error during fetching water status:', error);
      return h.response({
        status: "Failed",
        message: "Terjadi kesalahan internal saat mengambil status air tanaman.",
        code: 500,
      });
    }
  };
  
  const updateWaterStatus = async (request, h) => {
    try {
        const { is_muddy } = request.payload;

        // Pastikan is_muddy memiliki nilai sebelum dieksekusi
        if (is_muddy !== undefined) {
            const db = await createConnection();

            // Assuming you have a table named 'plants' for storing plant data
            await db.execute("UPDATE plants SET is_muddy = ? WHERE id = 1", [is_muddy]);

            return h.response({
                status: "Success",
                message: "Berhasil memperbarui status air tanaman",
                code: 200,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Gagal memperbarui status air tanaman. Parameter is_muddy tidak valid.",
                code: 400,
            });
        }
    } catch (error) {
        console.error('Error during updating water status:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat memperbarui status air tanaman.",
            code: 500,
        });
    }
};

const getWtempData = async (request, h) => {
    try {
        const db = await createConnection();

        // Assuming you have a table named 'wtemp' for storing water temperature data
        const [rows] = await db.execute("SELECT * FROM wtemp ORDER BY timestamp DESC LIMIT 1");

        if (rows.length > 0) {
            const wtempData = {
                wtemp: rows[0].wtemp,
                timestamp: rows[0].timestamp
            };

            return h.response({
                status: "Success",
                message: "Berhasil mendapatkan data water temperature",
                code: 200,
                data: wtempData,
            });
        } else {
            return h.response({
                status: "Failed",
                message: "Data water temperature tidak! ditemukan",
                code: 404,
            });
        }
    } catch (error) {
        console.error('Error during fetching water temperature data:', error);
        return h.response({
            status: "Failed",
            message: "Terjadi kesalahan internal saat mengambil data water temperature.",
            code: 500,
        });
    }
};



  

module.exports = {
    register,
    login,
    saveTemperature,
    getTemperatureData,
    savehumid,
    gethumid,
    saveTurbidity,
    getTurbidity,
    getTotalTurbidity,
    gettotalhumid,
    getWaterStatus,
    updateWaterStatus,
    getWtempData
}
