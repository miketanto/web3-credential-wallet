import { BigNumberish } from 'ethers'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useSWR from 'swr'

import { SkillsWalletABI, SkillsWalletAddress } from '../../constants/contracts'
import Container from '../../components/Container'
import useActiveAADAccount from '../../hooks/useActiveAADAccount'
import { useContract } from '../../hooks/useContract'

type SkillWallet = { [credentialId: string]: string } // [credentialAmount: string]

interface SkillSet {
  name: string,
  description: string,
  submitter: string,
  txHash: string,
  status: string,
}

interface SkillSetWithTokenId extends SkillSet {
  tokenId: string,
}

interface AllSkills {
  [tokenId: string]: SkillSet,
}

export default function MySkillsHome() {
  const { account, isAccountLoading } = useActiveAADAccount()

  const contract = useContract(SkillsWalletAddress, SkillsWalletABI)

  const [mySkills, setMySkills] = useState<SkillWallet>({})
  const [allSkills, setAllSkills] = useState<AllSkills>({})
  const { data: allSkillsData, error: allSkillsError } = useSWR(
    'http://localhost:4000/v2/skill/list',
    (url: string) => fetch(url).then((res) => res.json()),
  )
  const [userAddress] = useState<string>('0x19656Ac6e17F3A10e403710FDeC414B89131e70A')

  useEffect(() => {
    if (!allSkillsData?.payload?.skills.length) return
    const skillsData: AllSkills = {}
    allSkillsData.payload.skills.forEach((skill: SkillSetWithTokenId) => {
      skillsData[skill.tokenId] = skill
    })
    setAllSkills(skillsData)
  }, [allSkillsData])

  useEffect(() => {
    if (!contract || !Object.keys(allSkills).length) return
    console.log(allSkills)
    contract.getUserTokens(userAddress)
      .then((data: BigNumberish[]) => {
        console.log(data)
        const skillsData: SkillWallet = {}
        data.map((skill, i) => {
          skillsData[i] = skill.toString()
        })
        setMySkills(skillsData)
      })
  }, [allSkills])

  return (
    <Container className="pt-8">
      <div className="py-6 px-8 bg-white rounded-lg shadow-xl">
        <div className="flex flex-col">
          <div className="grow flex space-x-4 items-center">
            <div>
              <div className="h-20 w-20">
                {/* <img src={} /> */}
                <div className="h-full w-full bg-stone-200 rounded-full" />
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold">{`Hey, ${account?.firstName}!`}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {
            !Object.keys(mySkills).length && <div>No skills found!</div>
          }
          {
            Object.keys(mySkills).length > 0 && (
              Object.keys(mySkills).map((skillIdIdx) => {
                const skillId = String(Number(skillIdIdx) + 1)
                const amountOwned: string = mySkills[skillIdIdx].toString()
                console.log(skillId, amountOwned)
                // eslint-disable-next-line react/jsx-no-useless-fragment
                if (!Object.keys(allSkills).includes(skillId) || amountOwned === '0') return (<></>)
                const skill = allSkills[skillId]
                return (
                  <div key={skillId} className="px-4">
                    <div>
                      <span>{`${skillId}: `}</span>
                      <span>{skill.name}</span>
                    </div>
                    <div>
                      {skill.description}
                    </div>
                    <div>
                      <span>{`You own ${amountOwned} skills`}</span>
                    </div>
                  </div>
                )
              })
            )
          }
        </div>
      </div>
    </Container>
  )
}
