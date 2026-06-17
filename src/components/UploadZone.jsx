import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';

export default function UploadZone() {
  const { handleFilesUploaded, hasData, tickets, fileNames } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFiles = async (files) => {
    setError(null);
    const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json'));
    if (jsonFiles.length === 0) {
      setError('Please upload .json files');
      return;
    }
    try {
      await handleFilesUploaded(jsonFiles);
    } catch (e) {
      setError(`Failed to parse JSON: ${e.message}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) processFiles(e.target.files);
  };

  if (hasData) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-600">
          Loaded <span className="font-semibold text-gray-900">{tickets.length}</span> tickets from{' '}
          <span className="font-semibold text-gray-900">{fileNames.length}</span> file{fileNames.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors border border-gray-300"
        >
          Upload more
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-8 sm:p-16 text-center transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'
      }`}
    >
      <div className="text-gray-400 text-4xl sm:text-5xl mb-4">&#128203;</div>
      <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Upload Ticket Data</h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">Drag and drop your Intercom JSON export files here</p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
      >
        Choose Files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
