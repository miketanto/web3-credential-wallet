// Card Template for Student's Education Information
// Takes in Image (Generic if not Provided), School Name, Degree Name, and Graduation Year
// Used for each education the student has in database

import React, { Component } from 'react'
import Illinois from '../../assets/uiucProfile.jpg'

console.log(Illinois)

function EducationBlock({
  imageSource, schoolName, degree, graduationYear,
}:{imageSource:string, schoolName:string, degree:string, graduationYear:string}) {
  return (
    <div className="max-w-xl text-sm">
      <div className="p-6 sm:p-12 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src={imageSource}
            alt=""
            className="self-center flex-shrink-0 w-16 h-16 md:justify-self-start dark:bg-gray-500 dark:border-gray-700"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              {schoolName}
            </h4>
            <p className="max-w-xl text-stone-500 text-sm">
              {degree}
              {graduationYear}
            </p>
          </div>
        </div>
        <div className="flex justify-left pt-4 space-x-4 align-center" />
      </div>
    </div>
  )
}
export default EducationBlock
