// for each skill that User has, display skill information

import React, { Component } from 'react'

// interface UserSkills {
//     skillName: string;
//     badgePrimary:string;
//     badgeInfo:string;
//     description:string;

// }

function UserSkillBlock({
  skillName, badgePrimary, badgeInfo, description,
}: { skillName: string, badgePrimary: string, badgeInfo: string, description: string}) {
  return (
    <div className="py-3 px-4 border border-stone-200 rounded-lg hover:shadow-lg transition">
      <div className="flex flex-row items-center space-x-2">
        <span className="font-bold">{skillName}</span>
        <div className="badge badge-sm badge-success">
          &#10003;
        </div>
      </div>
      <div className="flex flex-row items-center space-x-2 pt-1">
        <div className="badge badge-sm badge-primary">
          {badgePrimary}
        </div>
        <div className="badge badge-sm badge-info">{badgeInfo}</div>
      </div>
      <div className="pt-2 text-sm">
        {description}
      </div>
    </div>
  )
}
export default UserSkillBlock
