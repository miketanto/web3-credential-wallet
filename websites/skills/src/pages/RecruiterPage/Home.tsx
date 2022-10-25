import React, { useState } from 'react'
import Select from 'react-select'
import StudentCard from '../../components/RecruiterProfile/StudentCard'

interface Skill {
  value: string;
  label: string;
}
const Leadership: Skill = { value: 'Leadership', label: 'Leadership' }
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
interface GradYear {
  value: number;
  label: number;
}
const year24: GradYear = { value: 2024, label: 2024 }
const year23: GradYear = { value: 2023, label: 2023 }
const year22: GradYear = { value: 2022, label: 2022 }
const year25: GradYear = { value: 2025, label: 2025 }
const year26: GradYear = { value: 2026, label: 2026 }
const yearOptions: GradYear[] = [
  year22,
  year23,
  year24,
  year25,
  year26,
]
interface Major {
  value: string;
  label: string;
}
const compsci: Major = { value: 'Computer Science', label: 'Computer Science' }
const stats: Major = { value: 'Statistics', label: 'Statistics' }
const physics: Major = { value: 'Physics', label: 'Physics' }
const engineering: Major = { value: 'Engineering', label: 'Engineering' }
const majorOptions: Major[] = [
  compsci,
  stats,
  physics,
  engineering,
]
const arr = [
  {
    id: 1,
    name: 'Person One',
    skills: [' Leadership', ' Java', ' Python '],
    year: 'Sophomore',
    graduationYear: 2025,
    major: 'Computer Science',
    image: 'C:/Users/jessi/Downloads/Disrpution-Lab-F22/SkillsWalletFA22/websites/skills/src/pages/assets/1.jpg',
  },
  {
    id: 2,
    name: 'Person Two',
    skills: [' Calculus', ' Python', ' Communication'],
    year: 'Sophomore',
    graduationTear: 2024,
    major: 'Computer Engineering',
    image: '../../assets/2.jpg',
  },
  {
    id: 3,
    name: 'Person Three',
    skills: [' Excel', ' Git', ' Quantum Computing'],
    year: 'Sophomore',
    graduationYear: 2025,
    major: 'Electrical Engineering',
    image: '../../assets/3.jpg',
  },
  {
    id: 4,
    name: 'Person Four',
    skills: [' Postman', ' Powerpoint', ' Cybersecurity'],
    year: 'Sophomore',
    graduationYear: 2024,
    major: 'Chemical Engineering',
    image: '../../assets/4.jpg',
  },
  {
    id: 5,
    name: 'Person Five',
    skills: [' Calculus'],
    year: 'Junior',
    graduationYear: 2024,
    major: 'Informational Science',
    image: '../../assets/5.jpg',
  },
  {
    id: 6,
    name: 'Person Six',
    skills: [' Excel', ' Data Science'],
    year: 'Junior',
    graduationYear: 2024,
    major: 'Psychology',
    image: '../../assets/6.jpg',
  },
  {
    id: 7,
    name: 'Person Seven',
    skills: [' Discrete Structures', ' Git'],
    year: 'Junior',
    graduationYear: 2024,
    major: 'Software Engineering',
    image: '../../assets/7.jpg',
  },
  {
    id: 8,
    name: 'Person Eight',
    skills: [' Git', ' Data Science', ' Excel'],
    year: 'Senior',
    graduationYear: 2023,
    major: 'Physics',
    image: '../../assets/8.jpg',
  },
  {
    id: 9,
    name: 'Person Nine',
    skills: [' Postman', ' Calculus', ' Leadership'],
    year: 'Senior',
    graduationYear: 2022,
    major: 'Mathematics',
    image: '../../assets/9.jpg',
  },
  {
    id: 10,
    name: 'Person Ten',
    skills: [' Python', ' Calculus', ' Git'],
    year: 'Senior',
    graduationYear: 2022,
    major: 'Computer Science and Statistics',
    image: '../../assets/10.jpg',
  },
]
export default function RecruiterPageHome() {
  const [searchSkills, setSearchSkills] = useState<string[]>([])
  const [searchYears, setSearchYears] = useState<number[]>([])
  const [searchMajors, setSearchMajors] = useState<string[]>([])
  const students = arr.filter((student) => {
    let containsSkills = true
    let containsYear = true
    let containsMajor = true
    for (let i = 0; i < searchSkills.length; i++) {
      let containsSkill = false
      for (let j = 0; j < student.skills.length; j++) {
        const skill = student.skills[j].trim()
        if (skill === searchSkills[i]) {
          containsSkill = true
          break
        }
      }
      if (containsSkill === false) {
        containsSkills = false
        break
      }
    }
    if (searchYears.length !== 0) {
      containsYear = false
      for (let i = 0; i < searchYears.length; i++) {
        if (searchYears[i] === student.graduationYear) {
          containsYear = true
        }
      }
    }
    if (searchMajors.length !== 0) {
      containsMajor = false
      for (let i = 0; i < searchMajors.length; i++) {
        const major = searchMajors[i].trim()
        if (student.major.toLowerCase().includes(major.toLowerCase())) {
          containsMajor = true
          break
        }
      }
    }
    if (containsSkills && containsYear && containsMajor) {
      return student
    }
  })
    .map((person) => <StudentCard key={person.id} name={person.name} skillsArray={person.skills} year={person.graduationYear as number} major={person.major} profileImage={person.image} />)
  const skillChangeHandler = (skillsSelected: readonly Skill[]) => {
    const skills: string[] = skillsSelected.map((skill) => skill.value)
    setSearchSkills(skills)
  }
  const yearChangeHandler = (yearsSelected: readonly GradYear[]) => {
    const years: number[] = yearsSelected.map((year) => year.value)
    setSearchYears(years)
  }
  const majorChangeHandler = (majorsSelected: readonly Major[]) => {
    const majors: string[] = majorsSelected.map((major) => major.value)
    setSearchMajors(majors)
  }
  return (
    <div className="h-screen">
      <div className="flex justify-center mt-10 py-10 h-screen gap-20">
        <div className="flex flex-col mb-10 w-1/3 ">
          <div className="py-3 pl-2 text-xl text-white font-semibold border-2 border-black bg-blue-900">
            <h1>Showing results for...</h1>
          </div>
          <div className="border-2 border-black mt-3 bg-blue-100">
            <h3 className="py-3 pl-3 text-lg">Skills</h3>
            <Select
              isMulti
              name="skills"
              options={skillsOptions}
              className="basic-multi-select w-3/4 pl-2 pb-3"
              classNamePrefix="select"
              onChange={skillChangeHandler}
            />
          </div>
          <div className="border-2 border-black mt-3 bg-blue-100">
            <h3 className="py-3 pl-3 text-lg">Graduation Year</h3>
            <Select
              isMulti
              name="graduation years"
              options={yearOptions}
              className="basic-multi-select w-3/4 pl-2 pb-3"
              classNamePrefix="select"
              onChange={yearChangeHandler}
            />
          </div>
          <div className="border-2 border-black mt-3 bg-blue-100">
            <h3 className="py-3 pl-3 text-lg">Major</h3>
            <Select
              isMulti
              name="graduation years"
              options={majorOptions}
              className="basic-multi-select w-3/4 pl-2 pb-3"
              classNamePrefix="select"
              onChange={majorChangeHandler}
            />
          </div>
        </div>
        <div className="overflow-y-auto float-left position-relative w-1/3 h-3/4 ml-1/6 mr-1/6 ">
          {students}
        </div>
      </div>
    </div>
  )
}
