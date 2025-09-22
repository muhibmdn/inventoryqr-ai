"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import bwipjs from "bwip-js";
import QRCode from "qrcode";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

type Step = 0 | 1 | 2;

type FilePreview = {
  file: File;
  previewUrl: string;
};

type DetailFormState = {
  name: string;
  description: string;
  brandModel: string;
  category: string;
  quantity: number;
  unitPrice: string;
  purchasedAt: string;
  fundingSource: string;
  location: string;
  floor: string;
  room: string;
  rack: string;
  condition: "NEW" | "GOOD" | "DEFECT" | "BROKEN";
  damagedAt: string;
  pic: string;
  lastCheckedAt: string;
};

const initialForm: DetailFormState = {
  name: "",
  description: "",
  brandModel: "",
  category: "",
  quantity: 1,
  unitPrice: "",
  purchasedAt: "",
  fundingSource: "",
  location: "",
  floor: "",
  room: "",
  rack: "",
  condition: "GOOD",
  damagedAt: "",
  pic: "",
  lastCheckedAt: "",
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const steps = ["Upload Image", "Edit Detail", "Generate QR/Barcode"] as const;

export default function GenerateQrBarcodePage() {
  const [step, setStep] = useState<Step>(0);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [form, setForm] = useState<DetailFormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);
  const [itemImageUrlBase64, setItemImageUrlBase64] = useState<string | null>(null); // New state for item image
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [files]);
  const createBarcodeImage = useCallback((value: string) => {
    const canvas = document.createElement("canvas");
    try {
      bwipjs.toCanvas(canvas, {
        bcid: "code128",
        text: value,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
        backgroundcolor: "FFFFFF",
        barcolor: "2E6431",
      });
      const output = canvas.toDataURL("image/webp", 0.9);
      if (!output.startsWith("data:image")) {
        return canvas.toDataURL("image/png");
      }
      return output;
    } catch (err) {
      console.error("Failed to render barcode", err);
      return null;
    }
  }, []);
  const convertToWebp = useCallback((dataUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak tersedia untuk konversi."));
          return;
        }
        ctx.drawImage(img, 0, 0);
        try {
          const result = canvas.toDataURL("image/webp", 0.92);
          resolve(result.startsWith("data:image") ? result : canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Gagal mengonversi ke WebP."));
        }
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar untuk konversi."));
      img.src = dataUrl;
    });
  }, []);


  const onFilesSelected = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const prepared = Array.from(incoming).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...prepared]);
    setError(null);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onFilesSelected(event.dataTransfer.files);
  }, [onFilesSelected]);

  const removeFile = useCallback((target: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((file) => file.previewUrl !== target);
      URL.revokeObjectURL(target);
      return filtered;
    });
  }, []);

  const handleAnalyzeImages = async () => {
    if (files.length === 0) {
      setError("Pilih setidaknya satu gambar untuk analisis.");
      return;
    }

    setError(null);
    setInfo(null);
    setIsAnalyzing(true);

    try {
      const firstFile = files[0].file;
      const imageUrl = await fileToBase64(firstFile); // Convert file to base64
      setItemImageUrlBase64(imageUrl); // Store the base64 image

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        let errorMessage = "Gagal menganalisis gambar. Silakan coba lagi.";
        try {
          const errorData = await response.json();
          if (
            errorData.details &&
            errorData.details.includes("Failed to find a valid JSON block")
          ) {
            errorMessage =
              "AI tidak dapat memproses gambar ini. Coba gunakan gambar yang lebih jelas atau coba lagi nanti.";
          } else {
            errorMessage =
              errorData.details ||
              errorData.error ||
              "Gagal menganalisis gambar.";
          }
        } catch {
          errorMessage =
            "Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.";
        }
        throw new Error(errorMessage);
      }

      const analyzedData = await response.json();
      console.log("Analyzed Data unitPrice:", analyzedData.unitPrice); // Debugging line

      setForm((prev) => ({
        ...prev,
        name: analyzedData.itemName || prev.name,
        description: analyzedData.description || prev.description,
        brandModel: analyzedData.brandModel || prev.brandModel,
        category: analyzedData.category || prev.category,
        unitPrice: analyzedData.unitPrice && analyzedData.unitPrice > 0 ? String(analyzedData.unitPrice) : "",
      }));

      setInfo("AI Granite telah mengisi detail barang secara otomatis. Silakan periksa kembali sebelum melanjutkan.");
      setStep(1);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menganalisis gambar.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormChange = <K extends keyof DetailFormState>(key: K, value: DetailFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateCodes = async () => {
    if (!form.name.trim()) {
      setError("Nama barang wajib diisi sebelum generate kode.");
      return;
    }

    setError(null);
    setInfo(null);
    setIsGenerating(true);

    const inventoryCode = `INV-${Date.now().toString(36).toUpperCase()}`;
    const barcodeImage = createBarcodeImage(inventoryCode);

    if (!barcodeImage) {
      setIsGenerating(false);
      setError("Gagal membuat barcode. Coba lagi.");
      return;
    }

    const qrPayload = JSON.stringify({
      code: inventoryCode,
      name: form.name,
      category: form.category,
      location: form.location,
    });

    try {
      const qrUrl = await QRCode.toDataURL(qrPayload, {
        color: {
          dark: "#216B5B",
          light: "#EAF6EE",
        },
        margin: 2,
        scale: 8,
      });
      const qrWebp = await convertToWebp(qrUrl);
      setQrDataUrl(qrWebp);
      setBarcodeDataUrl(barcodeImage);

      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          brandModel: form.brandModel || null,
          category: form.category || null,
          quantity: Number.isNaN(form.quantity) ? 0 : form.quantity,
          unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
          purchasedAt: form.purchasedAt || null,
          fundingSource: form.fundingSource || null,
          location: form.location || null,
          floor: form.floor || null,
          room: form.room || null,
          rack: form.rack || null,
          condition: form.condition,
          pic: form.pic || null,
          lastCheckedAt: form.lastCheckedAt || null,
          damagedAt: form.damagedAt || null,
          code: inventoryCode,
          qrPayload: inventoryCode,
          barcodePayload: inventoryCode,
          qrImage: qrWebp,
          barcodeImage,
          itemImage: itemImageUrlBase64, // Add the item image to the payload
        }),
      });

      setInfo("Data berhasil disimpan. QR dan barcode siap diunduh.");
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan data atau membuat kode. Coba lagi dalam beberapa saat.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (dataUrl: string | null, filename: string) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const stepStatus = useMemo(() =>
    steps.map((label, index) => {
      if (step > index) return { label, status: "done" } as const;
      if (step === index) return { label, status: "current" } as const;
      return { label, status: "upcoming" } as const;
    }),
  [step]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#216B5B]">Alur Generate Kode</p>
            <h2 className="text-xl font-semibold text-[#2E6431]">{steps[step]}</h2>
          </div>
          <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#216B5B]">
            {stepStatus.map(({ label, status }) => (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                  status === "current"
                    ? "border-[#36AF30] bg-[#EAF6EE] text-[#2E6431]"
                    : status === "done"
                      ? "border-[#CFE6D6] bg-[#CFE6D6] text-[#216B5B]"
                      : "border-white/30 bg-white/40 text-[#3E4643]"
                }`}
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : status === "current" ? (
                  <Sparkles className="h-3.5 w-3.5" />
                ) : (
                  <span className="inline-block h-2 w-2 rounded-full bg-current" />
                )}
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </div>
        {error && (
          <p className="mt-4 rounded-2xl border border-[#F6B8B8] bg-[#F6B8B8]/20 px-4 py-3 text-sm text-[#A83232]">
            {error}
          </p>
        )}
        {info && (
          <p className="mt-4 rounded-2xl border border-[#C7D9F7] bg-[#EAF2FD] px-4 py-3 text-sm text-[#185AB6]">
            {info}
          </p>
        )}
      </div>

      {step === 0 && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_minmax(0,0.9fr)]">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={onDrop}
            className="flex h-full flex-col justify-between rounded-3xl border-2 border-dashed border-[#2CBFA4]/70 bg-white/60 p-8 text-center text-[#216B5B]"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <UploadCloud className="h-12 w-12" />
              <div>
                <h3 className="text-lg font-semibold text-[#216B5B]">Tarik & letakkan gambar di sini</h3>
                <p className="mt-2 text-sm text-[#3E4643]">
                  Pilih satu gambar untuk analisis AI.
                </p>
              </div>
            </div>
            <label className="mt-8 inline-flex items-center justify-center gap-2 self-center rounded-full bg-[#36AF30] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#36AF30]/40 transition hover:bg-[#2E6431]">
              Pilih gambar
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => onFilesSelected(event.target.files)}
              />
            </label>
          </div>
          <div className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#216B5B]">Pratinjau Gambar</h3>
            <p className="mt-1 text-xs text-[#3E4643]">
              Hapus gambar yang tidak relevan sebelum menjalankan analisis.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {files.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#CFE6D6] bg-[#EAF6EE] px-4 py-6 text-center text-sm text-[#3E4643]">
                  Belum ada gambar yang dipilih.
                </div>
              )}
              {files.map((item) => (
                <div key={item.previewUrl} className="group relative overflow-hidden rounded-2xl border border-[#CFE6D6]">
                  <Image
                    src={item.previewUrl}
                    alt={`Preview ${item.file.name}`}
                    width={320}
                    height={240}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(item.previewUrl)}
                    className="absolute right-3 top-3 rounded-full bg-[#A83232] px-3 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleAnalyzeImages}
                className="inline-flex items-center gap-2 rounded-full bg-[#216B5B] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#216B5B]/30 transition hover:bg-[#2E6431]"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {isAnalyzing ? "Menganalisis..." : "Analisis Gambar"}
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#216B5B]">Gambar</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {files.map((item) => (
                    <Image
                      key={item.previewUrl}
                      src={item.previewUrl}
                      alt={`Preview ${item.file.name}`}
                      width={320}
                      height={240}
                      className="h-36 w-full rounded-2xl object-cover"
                    />
                  ))}
                  {files.length === 0 && (
                    <p className="rounded-2xl bg-[#EAF6EE] px-4 py-3 text-sm text-[#3E4643]">
                      Unggah gambar di langkah sebelumnya untuk melihat pratinjau.
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-[#216B5B]">Keterangan</h3>
                  <button
                    type="button"
                    onClick={handleAnalyzeImages}
                    className="inline-flex items-center gap-2 rounded-full border border-[#C7D9F7] bg-[#EAF2FD] px-3 py-1.5 text-xs font-semibold text-[#185AB6] transition hover:bg-[#C7D9F7]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Gunakan AI Granite
                  </button>
                </div>
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Nama Barang
                    <input
                      className="rounded-xl border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.name}
                      onChange={(event) => handleFormChange("name", event.target.value)}
                      placeholder="Contoh: Printer LaserJet Pro"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Deskripsi Barang <span className="text-xs text-[#185AB6]">(otomatis dari AI Granite)</span>
                    <textarea
                      className="min-h-[96px] rounded-xl border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.description}
                      onChange={(event) => handleFormChange("description", event.target.value)}
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm text-[#3E4643]">
                      Merk / Model*
                      <input
                        className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                        value={form.brandModel}
                        onChange={(event) => handleFormChange("brandModel", event.target.value)}
                        placeholder="HP LaserJet 203dw"
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-[#3E4643]">
                      Kategori Barang <span className="text-xs text-[#185AB6]">(disarankan)</span>
                      <select
                        className="w-full truncate rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                        value={form.category}
                        onChange={(event) => handleFormChange("category", event.target.value)}
                      >
                        <option value="">Pilih kategori</option>
                        <option value="Aset Tetap">Aset Tetap (Fixed Assets)</option>
                        <option value="Properti, Pabrik, dan Peralatan">Properti, Pabrik, dan Peralatan (PP&E)</option>
                        <option value="Tanah & Bangunan">Tanah & Bangunan</option>
                        <option value="Mesin & Peralatan Produksi">Mesin & Peralatan Produksi</option>
                        <option value="Kendaraan">Kendaraan</option>
                        <option value="Perabotan & Perlengkapan Kantor">Perabotan & Perlengkapan Kantor</option>
                        <option value="Aset Teknologi Informasi">Aset Teknologi Informasi (IT Assets)</option>
                        <option value="Perangkat Keras">Perangkat Keras (Hardware)</option>
                        <option value="Perangkat Lunak">Perangkat Lunak (Software)</option>
                        <option value="Perangkat Komunikasi">Perangkat Komunikasi</option>
                        <option value="Inventaris Barang Dagangan">Inventaris Barang Dagangan (Merchandise Inventory)</option>
                        <option value="Barang Jadi">Barang Jadi (Finished Goods)</option>
                        <option value="Barang dalam Proses">Barang dalam Proses (Work-in-Progress - WIP)</option>
                        <option value="Bahan Baku">Bahan Baku (Raw Materials)</option>
                        <option value="Perlengkapan & Kebutuhan Operasional">Perlengkapan & Kebutuhan Operasional (Supplies & Consumables)</option>
                        <option value="Perlengkapan Kantor">Perlengkapan Kantor (Office Supplies)</option>
                        <option value="Alat Tulis Kantor">Alat Tulis Kantor (ATK)</option>
                        <option value="Kebutuhan Pantry">Kebutuhan Pantry</option>
                        <option value="Perlengkapan Kebersihan">Perlengkapan Kebersihan (Janitorial Supplies)</option>
                        <option value="Perlengkapan Pemeliharaan">Perlengkapan Pemeliharaan (MRO)</option>
                        <option value="Suku Cadang">Suku Cadang (Spare Parts)</option>
                        <option value="Alat Keselamatan">Alat Keselamatan (Safety Equipment)</option>
                        <option value="Alat Kerja">Alat Kerja</option>
                        <option value="Aset Tidak Berwujud">Aset Tidak Berwujud (Intangible Assets)</option>
                        <option value="Hak Kekayaan Intelektual">Hak Kekayaan Intelektual</option>
                        <option value="Lisensi & Waralaba">Lisensi & Waralaba</option>
                        <option value="Goodwill">Goodwill</option>
                        <option value="Aset Lain-lain">Aset Lain-lain (Other Assets)</option>
                        <option value="Materi Pemasaran & Promosi">Materi Pemasaran & Promosi</option>
                        <option value="Dokumen & Arsip Penting">Dokumen & Arsip Penting</option>
                        <option value="Barang Sampel">Barang Sampel (Sample Goods)</option>
                      </select>
                    </label>
                  </div>
                </div>
              </article>
            </div>

            <div className="space-y-6">
              <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#216B5B]">Nilai Barang</h3>
                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Jumlah Barang
                    <input
                      type="number"
                      min={0}
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.quantity}
                      onChange={(event) => handleFormChange("quantity", Number(event.target.value) || 0)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Harga Barang*
                    <input
                      type="number"
                      min={0}
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.unitPrice}
                      onChange={(event) => handleFormChange("unitPrice", event.target.value)}
                      placeholder="cth: 4500000"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Waktu Beli*
                    <input
                      type="date"
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.purchasedAt}
                      onChange={(event) => handleFormChange("purchasedAt", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Sumber Dana*
                    <input
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.fundingSource}
                      onChange={(event) => handleFormChange("fundingSource", event.target.value)}
                      placeholder="APBD / Operasional / Hibah"
                    />
                  </label>
                </div>
              </article>

              <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#216B5B]">Letak Barang</h3>
                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Lokasi*
                    <input
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.location}
                      onChange={(event) => handleFormChange("location", event.target.value)}
                      placeholder="Gudang Pusat"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm text-[#3E4643]">
                      Lantai*
                      <input
                        className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                        value={form.floor}
                        onChange={(event) => handleFormChange("floor", event.target.value)}
                        placeholder="Lt. 2"
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-[#3E4643]">
                      Ruangan / Area*
                      <input
                        className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                        value={form.room}
                        onChange={(event) => handleFormChange("room", event.target.value)}
                        placeholder="Ruang Operasional"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Rak / Lemari*
                    <input
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.rack}
                      onChange={(event) => handleFormChange("rack", event.target.value)}
                      placeholder="Rak A3"
                    />
                  </label>
                </div>
              </article>

              <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#216B5B]">Kondisi Barang</h3>
                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Kondisi Barang
                    <select
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.condition}
                      onChange={(event) => handleFormChange("condition", event.target.value as DetailFormState["condition"])}
                    >
                      <option value="NEW">Baru</option>
                      <option value="GOOD">Baik</option>
                      <option value="DEFECT">Cacat</option>
                      <option value="BROKEN">Rusak</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Waktu Rusak*
                    <input
                      type="date"
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.damagedAt}
                      onChange={(event) => handleFormChange("damagedAt", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Penanggung Jawab*
                    <input
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.pic}
                      onChange={(event) => handleFormChange("pic", event.target.value)}
                      placeholder="Nama penanggung jawab"
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-[#3E4643]">
                    Tanggal Terakhir Diperiksa
                    <input
                      type="date"
                      className="rounded-xl border border-[#CFE6D6] bg-white px-4 py-2 text-sm focus:border-[#36AF30] focus:outline-none"
                      value={form.lastCheckedAt}
                      onChange={(event) => handleFormChange("lastCheckedAt", event.target.value)}
                    />
                  </label>
                </div>
              </article>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-2 rounded-full border border-[#CFE6D6] px-5 py-3 text-sm font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE]"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Upload
            </button>
            <button
              type="button"
              onClick={handleGenerateCodes}
              className="inline-flex items-center gap-2 rounded-full bg-[#36AF30] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#36AF30]/40 transition hover:bg-[#2E6431]"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {isGenerating ? "Menyimpan & Menghasilkan..." : "Generate QR / Barcode"}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#216B5B]">QR Code</h3>
            <p className="mt-1 text-xs text-[#3E4643]">Tempelkan pada barang untuk proses scan cepat.</p>
            <div className="mt-6 flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt="QR Code"
                  width={240}
                  height={240}
                  className="rounded-3xl border border-[#CFE6D6] bg-white p-4 shadow"
                />
              ) : (
                <div className="h-40 w-40 rounded-3xl border border-dashed border-[#CFE6D6] bg-[#EAF6EE]" />
              )}
              <button
                type="button"
                onClick={() => handleDownload(qrDataUrl, `${form.name || "invee"}-qr.webp`)}
                className="inline-flex items-center gap-2 rounded-full bg-[#216B5B] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#216B5B]/30 transition hover:bg-[#2E6431]"
              >
                Unduh QR
              </button>
            </div>
          </article>

          <article className="rounded-3xl border border-[#C7D9F7] bg-[#EAF2FD] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#185AB6]">Barcode</h3>
            <p className="mt-1 text-xs text-[#3E4643]">Gunakan untuk pelacakan inventori berbasis rak.</p>
            <div className="mt-6 flex flex-col items-center gap-4">
              {barcodeDataUrl ? (
                <Image
                  src={barcodeDataUrl}
                  alt="Barcode"
                  width={320}
                  height={120}
                  className="rounded-3xl border border-[#C7D9F7] bg-white p-4 shadow"
                />
              ) : (
                <div className="h-24 w-64 rounded-3xl border border-dashed border-[#C7D9F7] bg-white/70" />
              )}
              <button
                type="button"
                onClick={() => handleDownload(barcodeDataUrl, `${form.name || "invee"}-barcode.webp`)}
                className="inline-flex items-center gap-2 rounded-full border border-[#185AB6] bg-white px-5 py-3 text-sm font-semibold text-[#185AB6] transition hover:bg-[#C7D9F7]"
              >
                Unduh Barcode
              </button>
            </div>
          </article>

          <article className="lg:col-span-2 rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#216B5B]">Ringkasan Data</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-[#EAF6EE] px-4 py-3 text-sm text-[#343B38]">
                <p className="text-xs text-[#216B5B]">Nama Barang</p>
                <p className="font-semibold">{form.name || "-"}</p>
              </div>
              <div className="rounded-2xl bg-[#EAF2FD] px-4 py-3 text-sm text-[#343B38]">
                <p className="text-xs text-[#185AB6]">Kategori</p>
                <p className="font-semibold">{form.category || "-"}</p>
              </div>
              <div className="rounded-2xl bg-[#FFF7E6] px-4 py-3 text-sm text-[#343B38]">
                <p className="text-xs text-[#B97C00]">Jumlah</p>
                <p className="font-semibold">{form.quantity} unit</p>
              </div>
              <div className="rounded-2xl bg-[#F6B8B8]/40 px-4 py-3 text-sm text-[#343B38]">
                <p className="text-xs text-[#A83232]">Kondisi</p>
                <p className="font-semibold">
                  {form.condition === "NEW"
                    ? "Baru"
                    : form.condition === "GOOD"
                      ? "Baik"
                      : form.condition === "DEFECT"
                        ? "Cacat"
                        : "Rusak"}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-full border border-[#CFE6D6] px-5 py-3 text-sm font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE]"
              >
                Edit Detail Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setFiles([]);
                  setForm(initialForm);
                  setQrDataUrl(null);
                  setBarcodeDataUrl(null);
                  setInfo(null);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#36AF30] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#36AF30]/30 transition hover:bg-[#2E6431]"
              >
                Buat Item Baru
              </button>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

















