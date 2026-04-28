import * as React from 'react'

const S3 = 'https://amzn-3-backend-kyc-gomiile-731322152450-eu-north-1-an.s3.eu-north-1.amazonaws.com/emails'

export function GomileLogo() {
  return (
    <img src={`${S3}/gomile-logo-v2.png`} width="32" height="32" alt="Gomile" style={{ display: 'block' }} />
  )
}
