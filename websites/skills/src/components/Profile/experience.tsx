// for each experience the user has
import React, { Component } from 'react'
import GiesLogo from '../../assets/giesUIUC.png'

console.log(GiesLogo)
// array.map((bulletPoint) => (<li key={}>{bulletPoint}</li>))
const array = ['Spearhead blockchain development initiatives with Proof-of-Authority Ethereum chain.', 'Advocate for industry-standard practices']
// const arry2 = [""]
export default function ExperienceBlock() {
  return (
    <div className="max-w-xl text-sm">
      <div className="p-6 sm:p-12 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src={GiesLogo}
            alt=""
            className="self-center flex-shrink-0 w-16 h-16 md:justify-self-start dark:bg-gray-500 dark:border-gray-700"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              Disruption Lab
            </h4>
            <p className="max-w-xl font-semibold text-stone-500 text-sm">
              Technical Lead
            </p>
            <ul className="list-disc">
              {
                // array.map({item}) => {
                //   <li>{item}</li>
                // }
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
