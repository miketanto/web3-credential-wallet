import React from 'react'
import { Helmet } from 'react-helmet-async'

import Container from '../components/Container'
import PinBoard from '../components/PinBoard'
import PinBoardBody from '../components/PinBoard/Body'
import PinBoardHeader from '../components/PinBoard/Header'
import Illinois from '../assets/uiucProfile.jpg'
import GiesLogo from '../assets/giesUIUC.png'
import Education from '../components/Profile/Education'
import ExperienceBlock from '../components/Profile/experience'
import UserSkillBlock from '../components/Profile/UserSkills'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>iSkills - Home</title>
      </Helmet>
      <div>
        <Container flexRow className="space-x-4 pt-8">
          <section className="grow flex flex-col space-y-4">
            <PinBoard>
              <div className="h-24 w-auto rounded-t-lg bg-[url('../assets/UIUC-Quad.jpeg')] bg-cover bg-center" />
              <PinBoardBody>
                <div className="flex flex-row items-center space-x-2">
                  <div className="text-2xl font-bold">Jongwon Park</div>
                  <div className="text-stone-500 text-xs">(He/Him)</div>
                </div>
              </PinBoardBody>
            </PinBoard>
            <PinBoard>
              <PinBoardHeader>
                <div className="text-xl font-bold">About</div>
              </PinBoardHeader>
              <PinBoardBody>
                <div className="max-w-xl text-stone-500 text-sm">
                  Jongwon is a CS sophomore highly motivated in the blockchain
                  ecosystem. He has spent the last two years developing on-chain
                  dApps in Solidity and Rust. With his extensive JS/React
                  background of almost a decade, he is also comfortable writing
                  Web3 applications. He is mainly interested in the DeFi
                  ecosystem, both writing smart contracts and developing apps
                  that interact with on-chain components.
                </div>
              </PinBoardBody>
            </PinBoard>
            <PinBoard>
              <PinBoardHeader>
                <div className="text-xl font-bold">Education</div>
              </PinBoardHeader>
              <PinBoardBody>
                <Education />
              </PinBoardBody>
            </PinBoard>
            <PinBoard>
              <PinBoardHeader>
                <div className="text-xl font-bold">Experience</div>
              </PinBoardHeader>
              <PinBoardBody>
                <ExperienceBlock />
              </PinBoardBody>
            </PinBoard>
            <PinBoard>
              <PinBoardHeader>
                <div className="text-xl font-bold">Skills</div>
              </PinBoardHeader>
              <PinBoardBody>
                <div className="grid grid-cols-3 gap-x-4 w-full">
                  <UserSkillBlock
                    skillName="Python"
                    badgePrimary="Technology"
                    badgeInfo="Advanced"
                    description="Experience with Python Programming"
                  />
                  <UserSkillBlock
                    skillName="Cooking"
                    badgePrimary="Home Skills"
                    badgeInfo="Advanced"
                    description="Experience with Italian Cuisine"
                  />
                  <UserSkillBlock
                    skillName="Teamwork"
                    badgePrimary="Communication"
                    badgeInfo="Advanced"
                    description="History of working with others"
                  />

                </div>
              </PinBoardBody>
            </PinBoard>
          </section>
          <section className="w-[600px]">
            <span className="sr-only">Right section</span>
          </section>
        </Container>
      </div>
    </>
  )
}
