import React from 'react';

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  // Function to go to a specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Function to handle "Next" button
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle "Previous" button
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers with ellipsis if needed
  const pageNumbers = () => {
    const range = [];
    const leftEllipsis = currentPage > 3;
    const rightEllipsis = currentPage < totalPages - 2;

    if (leftEllipsis) range.push(1);
    if (leftEllipsis) range.push("...");
    if (currentPage > 1) range.push(currentPage - 1);
    range.push(currentPage);
    if (currentPage < totalPages) range.push(currentPage + 1);
    if (rightEllipsis) range.push("...");
    if (rightEllipsis) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex w-[70%] mt-4 left-0">
      <ul className="flex flex-row justify-center items-center space-x-10 md:w-full">
        {/* Previous Button */}
        <li>
          <button
            onClick={prevPage}
            className="px-8 py-2 bg-white rounded-md border border-gray-200 text-sm cursor-pointer "
            disabled={currentPage === 1}
          >
            <span className='mr-10'>&lt;</span> Previous
          </button>
        </li>

        {/* Page Numbers */}
        {pageNumbers().map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="px-4 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => goToPage(page)}
                className={`px-4 py-2  ${page === currentPage
                  ? "bg-gray-200 border border-gray-200 rounded-md text-gray-700 text-sm cursor-pointer"
                  : " text-[#2c2c2c] text-sm cursor-pointer hover:bg-gray-300 hover:rounded-md"
                  }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={nextPage}
            className="px-8 py-2 bg-white rounded-md border border-gray-200 text-sm cursor-pointer hover:bg-gray-300"
            disabled={currentPage === totalPages}
          >
            Next <span className='ml-10'>&gt;</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Pagination;
