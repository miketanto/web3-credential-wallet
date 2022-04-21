import React from 'react'
import { Helmet } from 'react-helmet-async'

import Container from '../components/Container'
import PinBoard from '../components/PinBoard'
import PinBoardBody from '../components/PinBoard/Body'
import PinBoardHeader from '../components/PinBoard/Header'

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
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                </div>
              </PinBoardBody>
            </PinBoard>
            <PinBoard>
              <PinBoardHeader>
                <div className="text-xl font-bold">Skills</div>
              </PinBoardHeader>
              <PinBoardBody>
                <div className="grid grid-cols-3 gap-x-4 w-full">
                  <div className="py-3 px-4 border border-stone-200 rounded-lg hover:shadow-lg transition">
                    <div className="flex flex-row items-center space-x-2">
                      <span className="font-bold">Skill 1</span>
                      <div className="badge badge-sm badge-success">&#10003;</div>
                    </div>
                    <div className="flex flex-row items-center space-x-2 pt-1">
                      <div className="badge badge-sm badge-primary">Technology</div>
                      <div className="badge badge-sm badge-info">Advanced</div>
                    </div>
                    <div className="pt-2 text-sm">Some content of the skill 1</div>
                  </div>
                  <div className="py-3 px-4 border border-stone-200 rounded-lg hover:shadow-lg transition">
                    <div className="flex flex-row items-center space-x-2">
                      <span className="font-bold">Skill 1</span>
                      <div className="badge badge-sm badge-success">&#10003;</div>
                    </div>
                    <div className="flex flex-row items-center space-x-2 pt-1">
                      <div className="badge badge-sm badge-primary">Technology</div>
                      <div className="badge badge-sm badge-info">Advanced</div>
                    </div>
                    <div className="pt-2 text-sm">Some content of the skill 1. The description may be longer than other skills.</div>
                  </div>
                  <div className="py-3 px-4 border border-stone-200 rounded-lg hover:shadow-lg transition">
                    <div className="flex flex-row items-center space-x-2">
                      <span className="font-bold">Skill 1</span>
                      <div className="badge badge-sm badge-success">&#10003;</div>
                    </div>
                    <div className="flex flex-row items-center space-x-2 pt-1">
                      <div className="badge badge-sm badge-primary">Technology</div>
                      <div className="badge badge-sm badge-info">Advanced</div>
                    </div>
                    <div className="pt-2 text-sm">Some content of the skill 1</div>
                  </div>
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
