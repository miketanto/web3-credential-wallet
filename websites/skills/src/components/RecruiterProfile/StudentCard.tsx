import React from 'react'
// import ProfilePic from '../../assets/defaultProfile.png'
import pic from '../../assets/4.jpg'

function RecruiterPageHome({
  name, skillsArray, year, major, profileImage,
}:{name:string, skillsArray:string[], year: number, major:string, profileImage:string}) {
  // const skillsArr = skillsArray.map((skill) => <li key={skill}>{skill}</li>)
  return (
    <div className="max-w-xl text-sm border-2 border-black mb-0.5">
      <div className="p-6 sm:p-12 dark:bg-gray-900 dark:text-gray-100 bg-white">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src={pic}
            alt="Profile"
            className="self-center flex-shrink-0 w-16 h-16 md:justify-self-start dark:bg-gray-500 dark:border-gray-700 border-2 border-black"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              {major}
            </h4>
            <p className="max-w-xl font-semibold text-stone-500 text-sm">
              {year}
            </p>
          </div>
        </div>
        <div className="flex justify-left pt-4 space-x-4 align-center" />
        <div>
          <p> Recent Experience: Disruption Lab </p>
          <ul>
            Skills:
            {skillsArray.toString()}
          </ul>
        </div>
      </div>
    </div>
  )
}
export default RecruiterPageHome
