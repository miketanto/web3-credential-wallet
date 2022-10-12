import React, { useState } from 'react'
import image from '../../assets/1.png'

const arr = [
  {
    name: 'Leadership',
    description: 'Description',
  },
  {
    name: 'C++',
    description: 'Description',
  },
  {
    name: 'Python',
    description: 'Description',
  },
  {
    name: 'Communication',
    description: 'Description',
  },
  {
    name: 'Empathy',
    description: 'Description',
  },
  {
    name: 'Hard Work',
    description: 'Description',
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
      <div key={data.name} className="w-1/3 ">
        <img src={image} alt="Avatar" />
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
      <div className="grid items-center md:grid-cols-2 lg:grid-cols-3 mt-10 justify-items-center">{arrData}</div>
    </>
  )
}
