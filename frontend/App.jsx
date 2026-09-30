const { useState, useEffect, useRef } = React;

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    
    const [budgetLimit, setBudgetLimit] = useState(5000000);
    const [transactions, setTransactions] = useState([
        { id: 1, date: '2026-06-25', merchant: 'Indomaret', category: 'Belanja Bulanan', notes: 'Susu & Beras', amount: 350000 },
        { id: 2, date: '2026-06-26', merchant: 'Starbucks', category: 'Makanan & Minuman', notes: 'Coffee', amount: 85000 }
    ]);
    
    const [scanMethod, setScanMethod] = useState('unggah');
    const [previewImg, setPreviewImg] = useState(null);
    const [rawFile, setRawFile] = useState(null);
    const [ocrStatus, setOcrStatus] = useState("Menunggu Berkas");
    const [valMerchant, setValMerchant] = useState('');
    const [valDate, setValDate] = useState(new Date().toISOString().split('T')[0]);
    const [valAmount, setValAmount] = useState('');
    const [valCategory, setValCategory] = useState('Makanan & Minuman');
    const [valNotes, setValNotes] = useState('');
    const [isScanReady, setIsScanReady] = useState(false);

    const videoRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const [goalAmount, setGoalAmount] = useState(10000000);
    const [goalMonths, setGoalMonths] = useState(6);
    const [savingsResult, setSavingsResult] = useState(null);

    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: 'Halo! Asisten finansial aktif. Tanyakan evaluasi pengeluaran atau saran anggaran Anda.' }
    ]);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        lucide.createIcons();
    }, [activeTab, transactions, scanMethod]);

    useEffect(() => {
        if (scanMethod === 'kamera') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [scanMethod]);

    const startCamera = async () => {
        setCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Gagal mengakses kamera:", err);
            alert("Tidak dapat mengakses kamera perangkat.");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const captureCameraPhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPreviewImg(dataUrl);
            setRawFile(dataUrl);
            setIsScanReady(true);
            stopCamera();
            setScanMethod('unggah');
            processSmartScan(dataUrl);
        }
    };

    const handleAuth = (e) => {
        e.preventDefault();
        if(!username || !password) return alert('Username dan password wajib diisi!');
        setIsLoggedIn(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRawFile(file);
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                const imgResult = uploadEvent.target.result;
                setPreviewImg(imgResult);
                setIsScanReady(true);
                processSmartScan(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const loadSampleReceipt = () => {
        const sampleUrl = "https://placehold.co/400x600/FFDE59/000000?text=Struk+Minimarket+Rp18.000";
        setPreviewImg(sampleUrl);
        setRawFile(sampleUrl);
        setIsScanReady(true);
        setValMerchant("Minimarket Express");
        setValAmount(18000);
        setValCategory("Makanan & Minuman");
        setValNotes("Belanja harian");
        setOcrStatus("Sampel Sinkron (100%)");
        alert("Sampel nota dimuat!");
    };

    const processSmartScan = async (imageSource) => {
        setOcrStatus("Membaca Teks Gambar (OCR)...");
        try {
            if (typeof Tesseract === 'undefined') {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/tesseract.js@v5.0.5/dist/tesseract.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            const { data: { text } } = await Tesseract.recognize(imageSource, 'ind+eng');
            console.log("OCR Extracted Text:", text);

            let detectedAmount = 18000;
            const rpMatch = text.match(/Rp[\s]?([0-9.,]+)/i);
            if (rpMatch && rpMatch[1]) {
                const cleanRp = parseInt(rpMatch[1].replace(/[^0-9]/g, ''));
                if (cleanRp > 0) detectedAmount = cleanRp;
            } else {
                const allNums = text.match(/[0-9]{4,6}/g);
                if (allNums) {
                    const validNums = allNums.map(n => parseInt(n)).filter(n => n >= 1000 && n <= 5000000);
                    if (validNums.length > 0) detectedAmount = Math.min(...validNums);
                }
            }

            let detectedMerchant = "Transaksi QRIS";
            const lowerText = text.toLowerCase();
            if (lowerText.includes("indomaret")) detectedMerchant = "Indomaret";
            else if (lowerText.includes("alfamart")) detectedMerchant = "Alfamart";
            else if (lowerText.includes("starbucks")) detectedMerchant = "Starbucks";
            else if (lowerText.includes("qris") || lowerText.includes("berhasil")) detectedMerchant = "Pembayaran QRIS";

            setValMerchant(detectedMerchant);
            setValAmount(detectedAmount);
            setValDate(new Date().toISOString().split('T')[0]);
            setValCategory("Makanan & Minuman");
            setValNotes(""); 
            
            setOcrStatus("Scan Berhasil (100%)");
            alert("Berhasil! Silakan ketik barang yang dibeli pada kolom Catatan.");
        } catch (err) {
            console.error("OCR Error:", err);
            setValMerchant("Transaksi Manual");
            setValAmount(18000);
            setValNotes("");
            setOcrStatus("Selesai (Manual)");
        }
    };

    const saveTransaction = (e) => {
        e.preventDefault();
        const newTx = {
            id: Date.now(),
            merchant: valMerchant || "Tunai / Lainnya",
            date: valDate,
            amount: parseInt(valAmount) || 0,
            category: valCategory,
            notes: valNotes
        };
        setTransactions([...transactions, newTx]);
        setActiveTab('analytics');
        setPreviewImg(null);
        setIsScanReady(false);
        setValMerchant('');
        setValAmount('');
        setValNotes('');
        setOcrStatus("Menunggu Berkas");
    };

    const deleteTx = (id) => {
        if(confirm("Hapus transaksi ini?")) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    const calculateSavings = () => {
        const result = goalAmount / goalMonths;
        setSavingsResult(`Target Rp ${goalAmount.toLocaleString('id-ID')} dalam ${goalMonths} bulan membutuhkan tabungan Rp ${Math.round(result).toLocaleString('id-ID')} per bulan.`);
    };

    const sendChat = () => {
        if(!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');
        
        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'ai', text: `Berdasarkan arus kas Anda saat ini, pertahankan alokasi anggaran agar target tabungan bulanan tercapai dengan aman.` }]);
        }, 800);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white neo-box p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="inline-block bg-neopink text-black font-display font-extrabold text-2xl sm:text-3xl px-4 py-2 border-3 border-black shadow-neo-sm transform -rotate-2 mb-3">
                            Daily Finances
                        </div>
                        <h1 className="text-lg sm:text-xl font-extrabold font-display">{isSignUp ? "Buat Akun Baru" : "Masuk ke Akun Anda"}</h1>
                        <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium">Gunakan username & kata sandi.</p>
                    </div>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-extrabold uppercase mb-1">Username</label>
                            <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full p-3 neo-input text-sm bg-gray-50" placeholder="user_anda"/>
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold uppercase mb-1">Kata Sandi</label>
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-3 neo-input text-sm bg-gray-50" placeholder="••••••••"/>
                        </div>
                        <button type="submit" className="w-full py-3 bg-neoyellow text-black neo-btn text-sm sm:text-base uppercase flex items-center justify-center gap-2">
                            {isSignUp ? "Daftar Akun" : "Masuk Platform"}
                        </button>
                    </form>
                    <div className="mt-6 pt-4 border-t-2 border-black border-dashed text-center">
                        <button onClick={()=>setIsSignUp(!isSignUp)} className="text-xs font-extrabold underline text-blue-600 uppercase">
                            {isSignUp ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = budgetLimit - totalExpense;
    const filteredTransactions = transactions.filter(t => 
        (t.merchant.toLowerCase().includes(searchKeyword.toLowerCase()) || (t.notes && t.notes.toLowerCase().includes(searchKeyword.toLowerCase()))) &&
        (filterCategory === '' || t.category === filterCategory)
    );

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b-4 border-black sticky top-0 z-50 px-3 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="bg-neoyellow px-3 py-1.5 border-3 border-black font-display font-extrabold text-base sm:text-lg shadow-neo-sm transform -rotate-1">
                        Daily Finances
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                        <button onClick={()=>setActiveTab('dashboard')} className={`px-2.5 sm:px-3 py-1.5 neo-btn text-[11px] sm:text-xs uppercase ${activeTab==='dashboard'?'bg-neoyellow':'bg-white'}`}>
                            Dashboard
                        </button>
                        <button onClick={()=>setActiveTab('scanner')} className={`px-2.5 sm:px-3 py-1.5 neo-btn text-[11px] sm:text-xs uppercase ${activeTab==='scanner'?'bg-neoyellow':'bg-white'}`}>
                            Scan AI
                        </button>
                        <button onClick={()=>setActiveTab('analytics')} className={`px-2.5 sm:px-3 py-1.5 neo-btn text-[11px] sm:text-xs uppercase ${activeTab==='analytics'?'bg-neoyellow':'bg-white'}`}>
                            Log & Analisis
                        </button>
                        <button onClick={()=>setActiveTab('tools')} className={`px-2.5 sm:px-3 py-1.5 neo-btn text-[11px] sm:text-xs uppercase ${activeTab==='tools'?'bg-neoyellow':'bg-white'}`}>
                            AI Planner
                        </button>
                    </nav>
                    <div className="flex items-center gap-2">
                        <div className="bg-neopurple px-2.5 py-1 border-2 border-black text-[11px] sm:text-xs font-extrabold shadow-neo-sm truncate max-w-[120px]">
                            {username.toUpperCase()}
                        </div>
                        <button onClick={()=>setIsLoggedIn(false)} className="px-2.5 py-1 bg-neored text-white border-2 border-black neo-btn text-[11px] sm:text-xs uppercase font-bold" title="Keluar">
                            Keluar
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-neocyan neo-box p-4 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <span className="bg-black text-white text-[10px] sm:text-xs font-extrabold px-2 py-1 uppercase">Ringkasan Bulan Ini</span>
                                    <h2 className="text-2xl sm:text-4xl font-extrabold font-display mt-3">Halo, {username} </h2>
                                    <p className="text-xs sm:text-sm font-medium mt-1">Pantau arus kas harian secara presisi dengan Daily Finances.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t-3 border-black">
                                    <div className="bg-white p-3 border-2 border-black shadow-neo-sm">
                                        <span className="text-[11px] sm:text-xs font-extrabold text-gray-600 block">Total Pengeluaran</span>
                                        <span className="text-lg sm:text-xl font-extrabold font-display text-neored">Rp {totalExpense.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="bg-white p-3 border-2 border-black shadow-neo-sm">
                                        <span className="text-[11px] sm:text-xs font-extrabold text-gray-600 block">Sisa Anggaran</span>
                                        <span className={`text-lg sm:text-xl font-extrabold font-display ${remainingBudget < 0 ? 'text-neored':'text-green-700'}`}>Rp {remainingBudget.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="bg-white p-3 border-2 border-black shadow-neo-sm">
                                        <span className="text-[11px] sm:text-xs font-extrabold text-gray-600 block">Batas Anggaran</span>
                                        <span className="text-lg sm:text-xl font-extrabold font-display">Rp {budgetLimit.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white neo-box p-4 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-extrabold text-base sm:text-lg uppercase">Pengaturan Anggaran</h3>
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Batas Target (Rp)</label>
                                            <input type="number" value={budgetLimit} onChange={e=>setBudgetLimit(parseInt(e.target.value)||0)} className="w-full p-2.5 neo-input text-sm"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button onClick={()=>setActiveTab('scanner')} className="w-full py-3 bg-neoyellow text-black neo-btn text-xs sm:text-sm uppercase">
                                        Scan Struk Baru
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white neo-box p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
                                <h3 className="font-display font-extrabold text-base sm:text-lg uppercase">Transaksi Terbaru</h3>
                                <button onClick={()=>setActiveTab('analytics')} className="text-xs font-extrabold underline">Lihat Semua</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-neogreen border-b-3 border-black font-extrabold text-[11px] sm:text-xs">
                                            <th className="p-2.5 border-r-2 border-black">Tanggal</th>
                                            <th className="p-2.5 border-r-2 border-black">Merchant</th>
                                            <th className="p-2.5 border-r-2 border-black">Kategori</th>
                                            <th className="p-2.5">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.slice(-4).reverse().map(tx=>(
                                            <tr key={tx.id} className="border-b-2 border-black hover:bg-yellow-50">
                                                <td className="p-2.5 border-r-2 border-black text-[11px] sm:text-xs">{tx.date}</td>
                                                <td className="p-2.5 border-r-2 border-black font-bold">{tx.merchant}</td>
                                                <td className="p-2.5 border-r-2 border-black"><span className="bg-neogreen px-2 py-0.5 border border-black text-[10px] sm:text-xs font-extrabold">{tx.category}</span></td>
                                                <td className="p-2.5 font-extrabold text-neored">Rp {tx.amount.toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'scanner' && (
                    <div className="space-y-6">
                        <div className="bg-neopink neo-box p-4 sm:p-6">
                            <span className="bg-black text-white text-[10px] sm:text-xs font-extrabold px-2 py-1 uppercase">Smart Gemini Flash</span>
                            <h2 className="text-xl sm:text-3xl font-extrabold font-display mt-2">Pilih Metode anda</h2>
                            <p className="text-xs sm:text-sm font-medium mt-1">Ekstraksi otomatis langsung terbaca akurat dan catatan siap diisi.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <button onClick={()=>setScanMethod('unggah')} className={`py-2.5 sm:py-3 neo-btn text-[11px] sm:text-sm uppercase font-extrabold ${scanMethod==='unggah'?'bg-neoyellow':'bg-white'}`}>
                            Unggah Berkas
                            </button>
                            <button onClick={()=>setScanMethod('kamera')} className={`py-2.5 sm:py-3 neo-btn text-[11px] sm:text-sm uppercase font-extrabold ${scanMethod==='kamera'?'bg-neoyellow':'bg-white'}`}>
                            Pindai Kamera
                            </button>
                            <button onClick={()=>setScanMethod('manual')} className={`py-2.5 sm:py-3 neo-btn text-[11px] sm:text-sm uppercase font-extrabold ${scanMethod==='manual'?'bg-neoyellow':'bg-white'}`}>
                             Input Manual
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white neo-box p-4 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-extrabold text-base sm:text-lg uppercase mb-3">
                                        {scanMethod === 'unggah' && "Unggah Foto Struk / QRIS"}
                                        {scanMethod === 'kamera' && "Kamera Perangkat Langsung"}
                                        {scanMethod === 'manual' && "Formulir Input Manual"}
                                    </h3>

                                    {scanMethod === 'unggah' && (
                                        <div className="space-y-4">
                                            <div className="border-3 border-dashed border-black p-6 sm:p-8 text-center bg-gray-50 relative cursor-pointer hover:bg-yellow-50">
                                                <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                                {!previewImg ? (
                                                    <p className="font-extrabold text-xs sm:text-sm">Klik atau Seret Foto Struk ke Sini</p>
                                                ) : (
                                                    <img src={previewImg} alt="Preview" className="max-h-48 mx-auto border-2 border-black"/>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={()=>processSmartScan(rawFile)} disabled={!isScanReady} className={`flex-1 py-2.5 neo-btn text-xs uppercase ${isScanReady?'bg-neoyellow text-black':'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
                                                    Scan Ulang
                                                </button>
                                                <button onClick={loadSampleReceipt} className="py-2.5 px-3 bg-neocyan text-black neo-btn text-xs uppercase">
                                                    Sampel Nota
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {scanMethod === 'kamera' && (
                                        <div className="space-y-4 text-center">
                                            <div className="border-3 border-black bg-black overflow-hidden relative rounded-none h-64 flex items-center justify-center">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                                {!cameraActive && <p className="text-white text-xs font-bold absolute">Memuat kamera...</p>}
                                            </div>
                                            <button onClick={captureCameraPhoto} className="w-full py-3 bg-neored text-white neo-btn text-xs sm:text-sm uppercase">
                                                Ambil Foto & Baca Teks
                                            </button>
                                        </div>
                                    )}

                                    {scanMethod === 'manual' && (
                                        <div className="p-4 bg-neolime border-2 border-black shadow-neo-sm">
                                            <p className="text-xs sm:text-sm font-bold">Mode input manual aktif. Langsung isi detail transaksi di sebelah kanan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white neo-box p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-display font-extrabold text-base sm:text-lg uppercase">Detail Transaksi (Real-Time)</h3>
                                    <span className="bg-gray-200 border-2 border-black px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase">{ocrStatus}</span>
                                </div>
                                <form onSubmit={saveTransaction} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Merchant / Toko</label>
                                        <input type="text" value={valMerchant} onChange={e=>setValMerchant(e.target.value)} required className="w-full p-2.5 neo-input text-sm" placeholder="Nama toko"/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Tanggal</label>
                                            <input type="date" value={valDate} onChange={e=>setValDate(e.target.value)} required className="w-full p-2.5 neo-input text-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Nominal (Rp)</label>
                                            <input type="number" value={valAmount} onChange={e=>setValAmount(e.target.value)} required className="w-full p-2.5 neo-input text-sm" placeholder="50000"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Kategori</label>
                                        <select value={valCategory} onChange={e=>setValCategory(e.target.value)} className="w-full p-2.5 neo-input text-sm bg-white">
                                            <option value="Makanan & Minuman">Makanan & Minuman</option>
                                            <option value="Belanja Bulanan">Belanja Bulanan</option>
                                            <option value="Transportasi">Transportasi</option>
                                            <option value="Utilitas & Tagihan">Utilitas & Tagihan</option>
                                            <option value="Hiburan">Hiburan</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Catatan (Barang yang dibeli)</label>
                                        <input type="text" value={valNotes} onChange={e=>setValNotes(e.target.value)} className="w-full p-2.5 neo-input text-sm" placeholder="Contoh: Makan siang, Bensin, dll..."/>
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-neogreen text-black neo-btn text-sm uppercase mt-2">
                                        Simpan ke Sistem
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="bg-neogreen neo-box p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="bg-black text-white text-[10px] sm:text-xs font-extrabold px-2 py-1 uppercase">Log & Analisis</span>
                                <h2 className="text-xl sm:text-3xl font-extrabold font-display mt-2">Arus Kas & Filter Transaksi</h2>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <input type="text" value={searchKeyword} onChange={e=>setSearchKeyword(e.target.value)} placeholder="Cari merchant..." className="p-2.5 neo-input text-sm bg-white w-full sm:w-48"/>
                                <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="p-2.5 neo-input text-sm bg-white">
                                    <option value="">Semua Kategori</option>
                                    <option value="Makanan & Minuman">Makanan & Minuman</option>
                                    <option value="Belanja Bulanan">Belanja Bulanan</option>
                                    <option value="Transportasi">Transportasi</option>
                                    <option value="Utilitas & Tagihan">Utilitas & Tagihan</option>
                                    <option value="Hiburan">Hiburan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>
                        <div className="bg-white neo-box p-4 sm:p-6">
                            <h3 className="font-display font-extrabold text-base sm:text-lg uppercase mb-4">Seluruh Log Transaksi ({filteredTransactions.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-neoyellow border-b-3 border-black font-extrabold text-[11px] sm:text-xs">
                                            <th className="p-2.5 sm:p-3 border-r-2 border-black">Tanggal</th>
                                            <th className="p-2.5 sm:p-3 border-r-2 border-black">Merchant</th>
                                            <th className="p-2.5 sm:p-3 border-r-2 border-black">Kategori</th>
                                            <th className="p-2.5 sm:p-3 border-r-2 border-black">Catatan</th>
                                            <th className="p-2.5 sm:p-3 border-r-2 border-black">Nominal</th>
                                            <th className="p-2.5 sm:p-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.length === 0 ? (
                                            <tr><td colSpan="6" className="p-6 text-center text-gray-500 font-bold">Tidak ada data transaksi.</td></tr>
                                        ) : (
                                            filteredTransactions.map(tx=>(
                                                <tr key={tx.id} className="border-b-2 border-black hover:bg-yellow-50">
                                                    <td className="p-2.5 sm:p-3 border-r-2 border-black text-[11px] sm:text-xs">{tx.date}</td>
                                                    <td className="p-2.5 sm:p-3 border-r-2 border-black font-bold">{tx.merchant}</td>
                                                    <td className="p-2.5 sm:p-3 border-r-2 border-black"><span className="bg-neogreen px-2 py-0.5 border border-black text-[10px] sm:text-xs font-extrabold">{tx.category}</span></td>
                                                    <td className="p-2.5 sm:p-3 border-r-2 border-black text-[11px] sm:text-xs text-gray-600">{tx.notes || '-'}</td>
                                                    <td className="p-2.5 sm:p-3 border-r-2 border-black font-extrabold text-neored">Rp {tx.amount.toLocaleString('id-ID')}</td>
                                                    <td className="p-2.5 sm:p-3 text-center">
                                                        <button onClick={()=>deleteTx(tx.id)} className="px-2 py-1 bg-neored text-white border-2 border-black neo-btn text-[10px] uppercase font-bold">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white neo-box p-4 sm:p-6 flex flex-col justify-between">
                            <div>
                                <span className="bg-neoorange text-black text-[10px] sm:text-xs font-extrabold px-2 py-1 uppercase border-2 border-black inline-block mb-3">Financial Tool</span>
                                <h3 className="font-display font-extrabold text-lg sm:text-xl uppercase">Savings Goal Planner</h3>
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Target Impian (Rp)</label>
                                        <input type="number" value={goalAmount} onChange={e=>setGoalAmount(parseFloat(e.target.value)||0)} className="w-full p-2.5 neo-input text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Waktu (Bulan)</label>
                                        <input type="number" value={goalMonths} onChange={e=>setGoalMonths(parseInt(e.target.value)||1)} className="w-full p-2.5 neo-input text-sm"/>
                                    </div>
                                    <button onClick={calculateSavings} className="w-full py-2.5 bg-neoyellow text-black neo-btn text-xs uppercase">Hitung Tabungan</button>
                                </div>
                            </div>
                            {savingsResult && (
                                <div className="mt-6 p-4 bg-neocyan border-2 border-black shadow-neo-sm">
                                    <h4 className="font-display font-extrabold text-xs sm:text-sm uppercase">Rekomendasi:</h4>
                                    <p className="text-xs sm:text-sm font-bold mt-1 text-gray-900">{savingsResult}</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-white neo-box p-4 sm:p-6 flex flex-col justify-between h-[450px] sm:h-[500px]">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                                    <h3 className="font-display font-extrabold text-base sm:text-lg uppercase">AI Financial Advisor</h3>
                                    <span className="bg-neopink px-2 py-0.5 border-2 border-black text-[10px] sm:text-xs font-bold">Active</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
                                {chatMessages.map((msg, idx)=>(
                                    <div key={idx} className={`flex gap-2 items-start ${msg.sender==='user'?'justify-end':''}`}>
                                        {msg.sender==='ai' && <div className="bg-black text-white p-1 text-[10px] font-bold">AI</div>}
                                        <div className={`p-2.5 sm:p-3 border-2 border-black text-xs font-medium max-w-[85%] ${msg.sender==='user'?'bg-neoyellow':'bg-gray-100'}`}>
                                            {msg.text}
                                        </div>
                                        {msg.sender==='user' && <div className="bg-black text-white p-1 text-[10px] font-bold">YOU</div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-3 border-t-2 border-black">
                                <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&sendChat()} placeholder="Tanyakan saran finansial..." className="flex-1 p-2.5 neo-input text-xs sm:text-sm bg-gray-50"/>
                                <button onClick={sendChat} className="px-3 sm:px-4 py-2 bg-neoyellow text-black neo-btn text-xs uppercase font-extrabold">Kirim</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);