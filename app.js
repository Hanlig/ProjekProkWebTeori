angular.module('absensiApp', [])
    .run(function($rootScope) {
        // Data awal daftar hadir disimpan di $rootScope
        $rootScope.daftar = [
            { 
                nama: 'Cara', 
                nim: '71251022', 
                matkul: 'Pemrograman Web', 
                waktu: new Date().toLocaleString(), 
                editing: false 
            },
            { 
                nama: 'Vin', 
                nim: '71251023', 
                matkul: 'Pemrograman Web', 
                waktu: new Date().toLocaleString(), 
                editing: false 
            }
        ];

        // Tambahkan properti 'selected' pada setiap item di daftar
        $rootScope.daftar = $rootScope.daftar.map(item => ({ ...item, selected: false }));
    })
    .controller('AbsensiController', function($scope, $rootScope) {
        // Data pengguna untuk login
        const users = [
            { username: 'admin', password: '1234', role: 'admin' },
            { username: 'user', password: '1234', role: 'user' }
        ];

        // Inisialisasi variabel scope
        $scope.loginData = {};
        $scope.isLoggedIn = false;
        $scope.isDarkMode = false;
        $scope.userRole = '';
        $scope.errorMsg = '';
        $scope.loginError = '';
        $scope.sortKey = 'nama';
        $scope.reverse = false;
        
        // Inisialisasi objek form data
        $scope.formData = {
            nama: '',
            nim: '',
            matkul: ''
        };

        // Fungsi login
        $scope.login = function() {
            const user = users.find(u => 
                u.username === $scope.loginData.username && 
                u.password === $scope.loginData.password
            );
            
            if (user) {
                $scope.isLoggedIn = true;
                $scope.userRole = user.role;
                $scope.loginError = '';
            } else {
                $scope.loginError = 'Username atau password salah!';
            }
        };

        // Fungsi logout
        $scope.logout = function() {
            $scope.isLoggedIn = false;
            $scope.loginData = {};
            $scope.userRole = '';
            $scope.isDarkMode = false;
            $scope.formData = { nama: '', nim: '', matkul: '' };
            $scope.errorMsg = '';
            $scope.loginError = '';
        };

        // Fungsi tambah nama ke daftar hadir
        $scope.tambahNama = function() {
            // Bersihkan pesan error sebelumnya
            $scope.errorMsg = '';
            
            // Ambil dan trim data dari form
            const nama = ($scope.formData.nama || '').trim();
            const nim = ($scope.formData.nim || '').trim();
            const matkul = ($scope.formData.matkul || '').trim();

            // Validasi field yang wajib diisi
            if (!nama || !nim || !matkul) {
                $scope.errorMsg = 'Semua kolom wajib diisi.';
                return;
            }

            // Validasi NIM hanya boleh angka dan harus tepat 8 digit
            const nimRegex = /^\d{8}$/; // NIM must be exactly 8 digits
            if (!nimRegex.test(nim)) {
                $scope.errorMsg = 'NIM harus terdiri dari tepat 8 angka.';
                return;
            }

            // Cek duplikasi NIM
            if ($rootScope.daftar.some(item => item.nim === nim)) {
                $scope.errorMsg = 'NIM sudah terdaftar!';
                return;
            }

            // Tambah data baru ke daftar
            $rootScope.daftar.push({
                nama: nama,
                nim: nim,
                matkul: matkul,
                waktu: new Date().toLocaleString(),
                editing: false,
                selected: false // Inisialisasi properti 'selected'
            });

            // Reset form setelah berhasil menambah data
            $scope.formData = {
                nama: '',
                nim: '',
                matkul: ''
            };
        };

        // Fungsi pilih semua data dengan toggle
        $scope.selectAll = function() {
            const allSelected = $rootScope.daftar.every(item => item.selected);
            $rootScope.daftar.forEach(item => item.selected = !allSelected);
        };

        // Fungsi hapus semua data dengan validasi dan pemberitahuan
        $scope.hapusSemuaData = function() {
            const allSelected = $rootScope.daftar.every(item => item.selected);
            if (!allSelected) {
                alert('Tidak bisa menghapus semua data karena ada yang belum dicentang.');
                return;
            }

            if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
                $rootScope.daftar = [];
            }
        };

        // Fungsi hapus data yang dicentang
        $scope.hapusDipilih = function() {
            $rootScope.daftar = $rootScope.daftar.filter(item => !item.selected);
        };

        // Update the function to use $rootScope.daftar instead of $scope.daftar
        $scope.hapusData = function() {
            $rootScope.daftar = $rootScope.daftar.filter(function(item) {
                return !item.selected;
            });
        };

        // Fungsi toggle edit mode
        $scope.toggleEdit = function(item) {
            if (item.editing) {
                // Simpan perubahan dan update timestamp
                item.waktu = new Date().toLocaleString();
            }
            item.editing = !item.editing;
        };

        // Fungsi sorting tabel
        $scope.sortBy = function(key) {
            $scope.reverse = ($scope.sortKey === key) ? !$scope.reverse : false;
            $scope.sortKey = key;
        };

        // Fungsi download CSV
        $scope.downloadCSV = function() {
            // Header CSV
            let csv = 'No,Nama,NIM,Mata Kuliah,Waktu Hadir\n';
            
            // Loop data dan tambahkan ke CSV
            $rootScope.daftar.forEach((item, i) => {
                csv += `${i + 1},"${item.nama}","${item.nim}","${item.matkul}","${item.waktu}"\n`;
            });

            // Buat dan download file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "daftar_hadir_" + new Date().toISOString().split('T')[0] + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Fungsi utilitas untuk format tanggal (opsional)
        $scope.formatDate = function(date) {
            return new Date(date).toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };

        // Event listener untuk enter key pada form login
        $scope.handleLoginKeyPress = function(event) {
            if (event.which === 13) { // Enter key
                $scope.login();
            }
        };

        // Event listener untuk enter key pada form tambah data
        $scope.handleFormKeyPress = function(event) {
            if (event.which === 13) { // Enter key
                $scope.tambahNama();
            }
        };
    });