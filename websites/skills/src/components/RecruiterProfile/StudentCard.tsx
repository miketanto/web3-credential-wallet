import React from 'react'
import ProfilePic from '../../assets/defaultProfile.png'

function RecruiterPageHome({
  name, skillsArray,
}:{name:string, skillsArray:string[]}) {
  const arr = skillsArray.map((skill) => <li key={skill}>{skill}</li>)
  return (
    <div className="flex justify-center h-36 mt-2">
      <div className="flex flex-col md:flex-row md:max-w-xl rounded-lg bg-white shadow-lg">
        <img className=" w-full h- md:h-auto object-cover md:w-48 rounded-t-lg md:rounded-none md:rounded-l-lg" src={ProfilePic} alt="" />
        <div className="p-6 flex flex-col justify-start">
          <h5 className="text-gray-900 text-xl font-medium mb-2">{name}</h5>
          <ul className="text-gray-700 text-base mb-4">
            {arr}
          </ul>
        </div>
      </div>
    </div>
  )
}
export default RecruiterPageHome
