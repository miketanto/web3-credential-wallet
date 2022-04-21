import React from 'react'

import PropTypes from 'prop-types'

// TODO: when clicked, open hashtag page showing other hashtag items
function ProductHashtag({ name }) {
  return (
    <div className="text-xs mr-1 py-1.5 px-3 text-gray-700 bg-arches-100 rounded-2xl">
      {`#${name}`}
    </div>
  )
}

ProductHashtag.propTypes = {
  name: PropTypes.string.isRequired,
}

export default ProductHashtag
