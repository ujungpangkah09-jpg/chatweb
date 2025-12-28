export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#efeae2]">
      <div className="w-[520px] max-w-[90%] text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm">
          <div className="w-24 h-24 mx-auto rounded-xl bg-[#dcf8c6] mb-6" />
          <h1 className="text-2xl font-semibold">Unduh WhatsApp untuk Windows</h1>
          <p className="text-sm text-gray-600 mt-2">
            Buat panggilan, bagikan layar, dan dapatkan pengalaman lebih cepat.
          </p>

          <button className="mt-6 px-6 py-2 rounded-full bg-[#25d366] text-white font-medium">
            Unduh
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
          <button className="bg-white rounded-xl px-6 py-4 shadow-sm">Kirim dokumen</button>
          <button className="bg-white rounded-xl px-6 py-4 shadow-sm">Tambah kontak</button>
          <button className="bg-white rounded-xl px-6 py-4 shadow-sm">Pencarian</button>
        </div>
      </div>
    </div>
  );
}
