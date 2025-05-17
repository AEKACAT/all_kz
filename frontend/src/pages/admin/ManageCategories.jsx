import React, { useContext, useEffect, useState } from 'react';
import CategoryContext from '../../state-management/CategoryContext';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import api from '../../api-services/apiConfig';
import { useTranslation } from 'react-i18next';

// Dummy category data
const dummyCategories = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Devices, gadgets, and accessories',
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Clothing and lifestyle accessories',
  },
];

function ManageCategories() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenBulkUploadModal, setIsOpenBulkUploadModal] = useState(false);
  

  // use context
  const { categories, fetchCategories,
    loading,
    error,
    message,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useContext(CategoryContext);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.description) return;

    const newEntry = {
      id: Date.now(),
      ...newCategory,
    };
    addCategory(newEntry);
    setNewCategory({ name: '', description: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm(t('confirmDeleteCategory'))) {
      deleteCategory(id);
    }
    
  };

  const handleUpdate = () => {  
    updateCategory(editingCategory);
    setEditingCategory(null);
    // setNewCategory({ name: '', description: '' });
  };

  const handleUploadCsvFile = async () => {

    if (!csvFile || csvFile === null) {
      toast.error( t('uploadCsvHint') );
      return;
    }
    const formData = new FormData();
    formData.append("file", csvFile);

    console.log(csvFile);

    setIsLoading(true);
    try {
      const res = await api.post("/category/upload-csv", formData);
      console.log(res); 
      if (res.status === 200) {
        toast.success(res.data.message);
        fetchCategories();
      }
      else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || t('uploadFailed') );
      if (error.response?.data?.errors) {
        const errorsFromServer = error.response.data.errors;
        // console.log(errorsFromServer);
        Object.keys(errorsFromServer).forEach((key) => {
          toast.error(errorsFromServer[key]);
        })
      }
    } finally {
      setIsLoading(false);
      setIsOpenBulkUploadModal(false);
    }
  }


  const isFormValid = !Object.values(newCategory).some((value) => value === '' || value === null);


  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('manageCategories')}</h2>

      {/* Form to Add Category */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder={t('categoryName')}
          className="w-full p-2 border rounded"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          required
        />
        <textarea
          placeholder={t('categoryDescription')}
          className="w-full p-2 border rounded"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          required
        />
        <button
          type="submit"
          className={`${loading || !isFormValid ? 'disable-button' : 'primary-button'}`}
          disabled={loading || !isFormValid}
        >
          {loading ? t('adding') : t('addCategory')}
        </button>
        <button
        type='button' 
        className="primary-button px-4 py-2 rounded-md shadow-md mx-2"
        onClick={() => setIsOpenBulkUploadModal(true)}
        >
          + {t('addBulk')}
        </button>
      </form>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('searchCategoryPlaceholder')}
          className="w-full border border-gray-300 rounded-md p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      
      {/* Category Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
  {filteredCategories.length > 0 ? (
    filteredCategories.map((cat) => (
      <div
        key={cat.id}
        className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 relative"
      >
        {/* If Editing */}
        {editingCategory?.id === cat.id ? (
          <>
            <input
              type="text"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              placeholder={t('categoryName')}
            />
            <textarea
              value={editingCategory.description}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring"
              placeholder={t('categoryDescription')}
              rows={3}
            />
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{cat.name}</h3>
            <p className="text-gray-600 text-sm">{cat.description}</p>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4 text-sm">
          {editingCategory?.id === cat.id ? (
            <button
              onClick={handleUpdate}
              className={`${loading  ? 'disable-button' : 'primary-button'}`}
              disabled={loading}
            >
              {loading ? t('saving') : t('save')}
            </button>
          ) : (
            <button
              onClick={() => setEditingCategory(cat)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => handleDelete(cat.id)}
            className={`${loading ? 'disable-button' : 'text-red-600 hover:underline cursor-pointer'}`}
            disabled={loading}
          >
            {loading ? t('deleting') : t('delete')}
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 col-span-full">{t('noCategoriesFound')}</p>
  )}
</div>

  {/* Modal for bulk upload */}
  {isOpenBulkUploadModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="relative bg-white p-6 w-full max-w-md rounded-2xl shadow-xl">
      
      {/* Close Icon */}
      <button
        onClick={() => setIsOpenBulkUploadModal(false)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold">{t('uploadCsvTitle')}</h2>
      {/* Provide a way to upload a CSV file, with fields name and description */}
      <p className='mb-4'>{t('uploadCsvHint')}</p>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setCsvFile(e.target.files[0])}
        className="w-full mb-4 border rounded px-3 py-2 cursor-pointer"
      />

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setIsOpenBulkUploadModal(false)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
        >
                {t('cancel')}
        </button>
        <button
          onClick={()=>handleUploadCsvFile()} // ✅ call the function, not return it
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
                {t('submit')}
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default ManageCategories;
