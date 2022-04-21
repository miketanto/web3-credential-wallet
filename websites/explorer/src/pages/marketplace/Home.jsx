import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import { wrap } from 'popmotion'
import React, { useState } from 'react'

import slideChampion from '../../assets/carousel/slide_Champion_Powerblend.jpeg'
import slideFreeplanner from '../../assets/carousel/slide_freeplanner.jpeg'
import slideLeague from '../../assets/carousel/slide_League.png'
import ProductCards from '../../components/Card/Products'
import Header from '../../layouts/marketplace/Header'
import { storeProducts } from '../../mock-data/store-products'
import classNames from '../../utils/classNames'

const variants = {
  enter: (direction) => ({ zIndex: 0, x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 }),
}

const images = [slideChampion, slideFreeplanner, slideLeague]

/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipeConfidenceThreshold = 10000
const swipePower = (offset, velocity) => Math.abs(offset) * velocity

export default function Home() {
  // https://codesandbox.io/s/framer-motion-image-gallery-pqvx3
  const [[page, direction], setPage] = useState([0, 0])

  // We only have 3 images, but we paginate them absolutely (ie 1, 2, 3, 4, 5...) and
  // then wrap that within 0-2 to find our image ID in the array below. By passing an
  // absolute page index as the `motion` component's `key` prop, `AnimatePresence` will
  // detect it as an entirely new image. So you can infinitely paginate as few as 1 images.
  const imageIndex = wrap(0, images.length, page)

  const paginate = (newDirection) => setPage([page + newDirection, newDirection])

  const carouselPaginateIcon = classNames('w-8', 'h-8')

  return (
    <div className="w-screen min-h-screen bg-gray-100 overflow-x-hidden">
      <Header />

      <div>
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="next" role="button" onClick={() => paginate(1)}>
              <FontAwesomeIcon icon="chevron-left" className={carouselPaginateIcon} />
            </div>
          </div>
          <div className="h-52 sm:h-80">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={page}
                src={images[imageIndex]}
                className="max-h-full inline-block"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x)
                  if (swipe < -swipeConfidenceThreshold) paginate(1)
                  else if (swipe > swipeConfidenceThreshold) paginate(-1)
                }}
              />
            </AnimatePresence>
          </div>
          <div className="flex items-center">
            <div className="next" role="button" onClick={() => paginate(-1)}>
              <FontAwesomeIcon icon="chevron-right" className={carouselPaginateIcon} />
            </div>
          </div>
        </div>
        <div className="max-w-7xl m-auto py-3 px-5 sm:py-5 sm:px-7">
          <div className="w- m-auto">
            <ProductCards items={storeProducts} perRowMobile={2} perRow={4} />
          </div>
        </div>
      </div>
    </div>
  )
}
