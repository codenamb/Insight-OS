import React, { useState } from 'react';
import Papa from 'papaparse';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle, Sparkles, X, RefreshCw } from 'lucide-react';
import { normalizePOSCSV, normalizeInventoryCSV } from '../utils/csvNormalizer';

interface CSVUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (posData: any[], inventoryData: any[]) => void;
}

export default function CSVUpload({ isOpen, onClose, onDataLoaded }: CSVUploadProps) {
  const [posData, setPosData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [posFilename, setPosFilename] = useState<string>('');
  const [inventoryFilename, setInventoryFilename] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handlePOSUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPosFilename(file.name);
    setErrorMsg('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrorMsg(`Error parsing POS CSV: ${results.errors[0].message}`);
          return;
        }

        const normalized = normalizePOSCSV(results.data);
        if (normalized.data.length === 0) {
          setErrorMsg('No valid POS sales records found. Check CSV column names.');
          return;
        }

        setPosData(normalized.data);
        setSuccessMsg(`Successfully loaded ${normalized.data.length} POS sales transactions.`);
      },
    });

    // Reset input value so re-uploading the same file triggers onChange
    e.target.value = '';
  };

  const handleInventoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInventoryFilename(file.name);
    setErrorMsg('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrorMsg(`Error parsing Inventory CSV: ${results.errors[0].message}`);
          return;
        }

        const normalized = normalizeInventoryCSV(results.data);
        if (normalized.data.length === 0) {
          setErrorMsg('No valid Inventory records found. Check CSV column names.');
          return;
        }

        setInventoryData(normalized.data);
        setSuccessMsg(`Successfully loaded ${normalized.data.length} inventory stock items.`);
      },
    });

    // Reset input value so re-uploading the same file triggers onChange
    e.target.value = '';
  };

  const handleClearPOS = () => {
    setPosData([]);
    setPosFilename('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleClearInventory = () => {
    setInventoryData([]);
    setInventoryFilename('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleApplyData = () => {
    onDataLoaded(posData, inventoryData);
    onClose();
  };

  const downloadPOSTemplate = () => {
    const template =
      'Transaction Date,Shop Location,Item Code,Item Description,Department,Qty Sold,Sales Amount,Cost Price,Store Lat,Store Lng\n' +
      '2026-08-01,Mumbai Central Flagship,PRD-001,Pro Wireless Headphones,Electronics,15,44985,1650.00,18.9696,72.8193\n' +
      '2026-08-02,Bengaluru Tech Outlet,PRD-002,Ultra HD Smart TV 55",Electronics,8,359992,25000.00,12.9716,77.5946\n';

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pos_data_inr_template.csv';
    link.click();
  };

  const downloadInventoryTemplate = () => {
    const template =
      'SKU,Product Title,Category Group,Qty On Hand,Min Threshold,Buy Price,Vendor Name,Last Received,Expiry Date\n' +
      'PRD-001,Pro Wireless Headphones,Electronics,8,25,1650.00,AudioTech India,2026-07-20,\n' +
      'PRD-005,Organic South Indian Coffee 1kg,Grocery,42,30,240.00,Tata Coffee Co,2026-07-01,2026-08-20\n' +
      'PRD-011,Premium Wool Winter Coat,Apparel,35,10,2800.00,Monte Carlo Wear,2026-07-08,2026-08-28\n';

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_stock_inr_template.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="webstacked-card rounded-3xl p-6 lg:p-8 max-w-2xl w-full space-y-6 relative border border-white/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold webstacked-badge-lime flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Smart Auto-Normalizer
            </span>
          </div>
          <h2 className="text-xl font-black text-white font-['Geist']">Upload Retail CSV Datasets</h2>
          <p className="text-xs text-slate-400">
            Upload custom POS sales logs or inventory stock CSV files. Non-standard column headers are automatically mapped!
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* POS Upload Box */}
          <div className="p-5 rounded-2xl bg-[#08090c] border border-white/10 space-y-3 relative text-center flex flex-col justify-between">
            <div className="space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-[#8cff2e] mx-auto" />
              <div>
                <h4 className="font-bold text-white text-xs">POS Sales Data CSV</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Transactions, prices, & stores</p>
              </div>
            </div>

            <div className="my-2">
              {posFilename ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 bg-[#12141a] border border-[#8cff2e]/40 py-2 px-3 rounded-xl">
                    <span className="text-xs text-[#8cff2e] font-semibold truncate max-w-[160px]" title={posFilename}>
                      {posFilename}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearPOS}
                      className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors shrink-0 cursor-pointer"
                      title="Remove selected POS file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#8cff2e] underline cursor-pointer transition-colors">
                    <RefreshCw className="w-3 h-3" /> Change POS File
                    <input type="file" accept=".csv" onChange={handlePOSUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="block py-2.5 px-3 rounded-xl bg-[#12141a] hover:bg-[#1a1d26] border border-white/10 text-xs text-slate-300 font-semibold cursor-pointer transition-colors">
                  Select POS CSV
                  <input type="file" accept=".csv" onChange={handlePOSUpload} className="hidden" />
                </label>
              )}
            </div>

            <button
              onClick={downloadPOSTemplate}
              className="text-[11px] text-cyan-400 hover:underline font-semibold flex items-center gap-1 mx-auto"
            >
              <Download className="w-3 h-3" /> Download POS Template
            </button>
          </div>

          {/* Inventory Upload Box */}
          <div className="p-5 rounded-2xl bg-[#08090c] border border-white/10 space-y-3 relative text-center flex flex-col justify-between">
            <div className="space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto" />
              <div>
                <h4 className="font-bold text-white text-xs">Inventory Stock CSV (with Expiry)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Stock levels & expiry dates</p>
              </div>
            </div>

            <div className="my-2">
              {inventoryFilename ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1 bg-[#12141a] border border-cyan-400/40 py-2 px-3 rounded-xl">
                    <span className="text-xs text-cyan-400 font-semibold truncate max-w-[160px]" title={inventoryFilename}>
                      {inventoryFilename}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearInventory}
                      className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors shrink-0 cursor-pointer"
                      title="Remove selected Inventory file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 underline cursor-pointer transition-colors">
                    <RefreshCw className="w-3 h-3" /> Change Inventory File
                    <input type="file" accept=".csv" onChange={handleInventoryUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="block py-2.5 px-3 rounded-xl bg-[#12141a] hover:bg-[#1a1d26] border border-white/10 text-xs text-slate-300 font-semibold cursor-pointer transition-colors">
                  Select Inventory CSV
                  <input type="file" accept=".csv" onChange={handleInventoryUpload} className="hidden" />
                </label>
              )}
            </div>

            <button
              onClick={downloadInventoryTemplate}
              className="text-[11px] text-[#8cff2e] hover:underline font-semibold flex items-center gap-1 mx-auto"
            >
              <Download className="w-3 h-3" /> Download Stock Template
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyData}
            disabled={posData.length === 0 && inventoryData.length === 0}
            className="px-6 py-2.5 rounded-2xl webstacked-button-primary text-xs font-bold shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Apply Dataset & Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
