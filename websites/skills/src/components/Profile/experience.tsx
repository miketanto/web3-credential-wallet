// Card Template for Student's Experience  Information
// Takes in Image (Generic if not provided), Experience Name (Employer), Role, and description paragraph
// Used for each experience the students in database
import React, { Component } from 'react'
import GiesLogo from '../../assets/giesUIUC.png'

console.log(GiesLogo)
// example data
const array = ['Spearhead blockchain development initiatives with Proof-of-Authority Ethereum chain.', 'Advocate for industry-standard practices']
function ExperienceBlock({
  imageSource, expName, role,
} : {imageSource: string, expName:string, role:string}) {
  return (
    <div className="max-w-xl text-sm">
      <div className="p-6 sm:p-12 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src={imageSource}
            alt="not found"
            className="self-center flex-shrink-0 w-16 h-16 md:justify-self-start dark:bg-gray-500 dark:border-gray-700"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              {expName}
            </h4>
            <p className="max-w-xl font-semibold text-stone-500 text-sm">
              {role}
            </p>
            <ul className="list-disc">
              {
                         array.map((id, bulletPoint) => (<li key={id}>{array[bulletPoint]}</li>))

                }
            </ul>
          </div>
        </div>
        <div className="flex justify-left pt-4 space-x-4 align-center" />
      </div>
    </div>
  )
}

export default ExperienceBlock
