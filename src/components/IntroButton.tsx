'use client'  // Add this line at the top of the file

import React from 'react'

const IntroButton = () => {
  const downloadPDF = (filename: string) => {
    // Create a link element
    const link = document.createElement('a');
    link.href = `/${filename}`; // Assuming the PDFs are in the public folder
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className="max-container padding-container flex flex-col gap-20 md:gap-28 xl:flex-row ">      
        <div className="mt-10 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#8A1457]">
          Download Introduction Booklet
        </h2>
            <div className="flex flex-col mt-3 w-full gap-2 sm:flex-row  items-center justify-center">
              <button 
                onClick={() => downloadPDF('hindi-booklet.pdf')}
                className="flexCenter gap-3 rounded-full border btn_green"
              >
                Hindi
              </button>
              <button 
                onClick={() => downloadPDF('eng-booklet.pdf')}
                className="flexCenter gap-3 rounded-full border btn_green"
              >
                English
              </button>
            </div>
        </div>
    </section>
  )
}

export default IntroButton