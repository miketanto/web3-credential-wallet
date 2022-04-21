import React from 'react'
import { ErrorBoundary as ErrorBoundaryImport } from 'react-error-boundary'

// eslint-disable-next-line react/prop-types
function ErrorFallback({ error, resetErrorBoundary }) {
  // eslint-disable-next-line react/prop-types
  console.log(error.message)
  // ReactGA.exception({
  //   ...error,
  //   ...errorInfo,
  //   fatal: true,
  // })

  return (
    <div role="alert">
      <div className="flex flex-col items-center w-full">
        <div className="w-full p-4">
          <div className="py-2 px-4">
            <div className="text-xl font-bold">Something went wrong</div>
            <button type="button" onClick={resetErrorBoundary}>Try again</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorReset() {
  // TODO: reset the state of app so the error doesn't happen again
}

// eslint-disable-next-line react/prop-types
export default function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryImport
      FallbackComponent={ErrorFallback}
      onReset={() => ErrorReset()}
    >
      {children}
    </ErrorBoundaryImport>
  )
}
