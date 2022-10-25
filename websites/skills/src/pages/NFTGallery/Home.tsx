import React, { useState } from 'react'
import pythonImage from '../../assets/python.jpg'
import javaImage from '../../assets/java.jpeg'
import leadershipImage from '../../assets/leadership.jpeg'
import communicationImage from '../../assets/communication.png'
import excelImage from '../../assets/excel.png'
import gitImage from '../../assets/git.png'
import postmanImage from '../../assets/postman.jpeg'
import powerpointImage from '../../assets/powerpoint.webp'
import mathImage from '../../assets/math.jpeg'
import quantImage from '../../assets/quantumcomputing.webp'
import cyberImage from '../../assets/cyber.jpeg'
import datascienceImage from '../../assets/datascience.png'
import aiImage from '../../assets/ai.jpeg'
import hardworkImage from '../../assets/hardwork.jpeg'
import calculusImage from '../../assets/calc.png'

const arr = [
  {
    name: 'Leadership',
    description: 'Description',
    image: leadershipImage,
  },
  {
    name: 'Java',
    description: 'Description',
    image: javaImage,
  },
  {
    name: 'Python',
    description: 'Description',
    image: pythonImage,
  },
  {
    name: 'Communication',
    description: 'Description',
    image: communicationImage,
  },
  {
    name: 'Calculus',
    description: 'Description',
    image: calculusImage,
  },
  {
    name: 'Hard Work',
    description: 'Description',
    image: hardworkImage,
  },
  {
    name: 'Excel',
    description: 'Description',
    image: excelImage,
  },
  {
    name: 'Git',
    description: 'Description',
    image: gitImage,
  },
  {
    name: 'Postman',
    description: 'Description',
    image: postmanImage,
  },
  {
    name: 'Powerpoint',
    description: 'Description',
    image: powerpointImage,
  },
  {
    name: 'Discrete Structures',
    description: 'Description',
    image: mathImage,
  },
  {
    name: 'Artificial Intelligence',
    description: 'Description',
    image: aiImage,
  },
  {
    name: 'Data Science',
    description: 'Description',
    image: datascienceImage,
  },
  {
    name: 'Cybersecurity',
    description: 'Description',
    image: cyberImage,

  },
  {
    name: 'Quantum Computing',
    description: 'Description',
    image: quantImage,
  },
]

export default function GalleryHome() {
  const [searchQuery, setSearchQuery] = useState('')

  const arrData = arr
    .filter((data) => {
      const trimmedQuery = searchQuery.trim()
      if (trimmedQuery === '') {
        return data
      }
      if (data.name.toLowerCase().startsWith(trimmedQuery.toLowerCase())) {
        return data
      }
    })
    .map((data) => (
      <div key={data.name} className="w-1/3 h-1/15 ">
        <img src={data.image} alt="Avatar" />
        <div className="text-center">
          <h4>
            <b>{data.name}</b>
          </h4>
          <p>{data.description}</p>
        </div>
      </div>
    ))
  const changeSearchQuery = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchQuery(e.currentTarget.value)
  }

  return (
    <>
      <form className="mt-10 w-6/12 ml-auto mr-auto">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="w-full py-3 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-indigo-600"
            onChange={changeSearchQuery}
          />
        </div>
      </form>
      <div className="border-solid border-black grid items-center md:grid-cols-3 lg:grid-cols-5 mt-10 justify-items-center ">{arrData}</div>
    </>
  )
}
