import React, { useState } from 'react'
import Select from 'react-select'
import StudentCard from '../../components/RecruiterProfile/StudentCard'

interface Skill {
  value: string;
  label: string;
}
const Leadership: Skill = {
  value: 'Leadership',
  label: 'Leadership',
}
const DiscreteStructures: Skill = { value: 'Discrete Structures', label: 'Discrete Structures' }
const ArtificialIntelligence: Skill = { value: 'Artificial Intelligence', label: 'Artificial Intelligence' }
const CyberSecurity: Skill = { value: 'Cybersecurity', label: 'Cybersecurity' }
const Java: Skill = { value: 'Java', label: 'Java' }
const Python: Skill = { value: 'Python', label: 'Python' }
const Calculus: Skill = { value: 'Calculus', label: 'Calculus' }
const HardWork: Skill = { value: 'Hard Work', label: 'Hard Work' }
const Excel: Skill = { value: 'Excel', label: 'Excel' }
const Git: Skill = { value: 'Git', label: 'Git' }
const Postman: Skill = { value: 'Postman', label: 'Postman' }
const DataScience: Skill = { value: 'Data Science', label: 'Data Science' }
const QuantumComputing:Skill = { value: 'Quantum Computing', label: 'Quantum Computing' }

const skillsOptions: Skill[] = [
  Leadership,
  DiscreteStructures,
  ArtificialIntelligence,
  CyberSecurity,
  Java,
  Python,
  Calculus,
  HardWork,
  Excel,
  Git,
  Postman,
  DataScience,
  QuantumComputing,
]

const arr = [
  {
    id: 1,
    name: 'Person One',
    skills: ['Leadership', 'Java', 'Python'],
  },
  {
    id: 2,
    name: 'Person Two',
    skills: ['Calculus', 'Python', 'Communication'],
  },
  {
    id: 3,
    name: 'Person Three',
    skills: ['Excel', 'Git', 'Quantum Computing'],
  },
  {
    id: 4,
    name: 'Person Four',
    skills: ['Postman', 'Powerpoint', 'Cybersecurity'],
  },
  {
    id: 5,
    name: 'Person Five',
    skills: ['Calculus'],
  },
  {
    id: 6,
    name: 'Person Six',
    skills: ['Excel', 'Data Science'],
  },
  {
    id: 7,
    name: 'Person Seven',
    skills: ['Discrete Structures', 'Git'],
  },
  {
    id: 8,
    name: 'Person Eight',
    skills: ['Git', 'Data Science', 'Excel'],
  },
  {
    id: 9,
    name: 'Person Nine',
    skills: ['Postman', 'Calculus', 'Leadership'],
  },
  {
    id: 10,
    name: 'Person Eight',
    skills: ['Python', 'Calculus', 'Git'],
  },
  {
    id: 11,
    name: 'Person Nine',
    skills: ['Python', 'Calculus', 'Git'],
  },
  {
    id: 12,
    name: 'Person Ten',
    skills: ['Quantum Computing', 'Data Science', 'Git'],
  },
  {
    id: 13,
    name: 'Person Eleven',
    skills: ['Python', 'Communication', 'Java'],
  },
  {
    id: 14,
    name: 'Person Twelve',
    skills: [],
  },
  {
    id: 15,
    name: 'Person Thirteen',
    skills: ['Data Science'],
  },
]

export default function RecruiterPageHome() {
  const [searchSkills, setSearchSkills] = useState<string[]>([])
  const students = arr.filter((student) => {
    let containsSkills = true
    for (let i = 0; i < searchSkills.length; i++) {
      if (!student.skills.includes(searchSkills[i])) {
        containsSkills = false
        break
      }
    }
    if (containsSkills) {
      return student
    }
  })
    .map((person) => <StudentCard key={person.id} name={person.name} skillsArray={person.skills} />)

  const skillChangeHandler = (skillsSelected: readonly Skill[]) => {
    const skills: string[] = skillsSelected.map((skill) => skill.value)
    setSearchSkills(skills)
  }

  return (
    <>
      <div className="mt-10  flex justify-center">
        <Select
          isMulti
          name="skills"
          options={skillsOptions}
          className="basic-multi-select w-1/2"
          classNamePrefix="select"
          onChange={skillChangeHandler}
        />
      </div>
      <div className="mt-10 h-96 overflow-scroll">
        {students}
      </div>
    </>
  )
}
