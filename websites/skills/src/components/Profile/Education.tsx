// for each education that the user has

import React, { Component } from 'react'
import Illinois from '../../assets/uiucProfile.jpg'

console.log(Illinois)

// interface Education {
//   schoolName: "University of Illinois Urbana Champaign";
//   description: "Bachelors of Computer Science 2021-2025";
//   image: "../assets/uiucProfile.jpg";

// }

export default function EducationBlock() {
  return (
    <div className="max-w-xl text-sm">
      <div className="p-6 sm:p-12 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src={Illinois}
            alt=""
            className="self-center flex-shrink-0 w-16 h-16 md:justify-self-start dark:bg-gray-500 dark:border-gray-700"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              University of Illinois Urbana Champaign
            </h4>
            <p className="max-w-xl text-stone-500 text-sm">
              Bachelors of Computer Science 2021-2025
            </p>
          </div>
        </div>
        <div className="flex justify-left pt-4 space-x-4 align-center" />
      </div>
    </div>
  )
}
