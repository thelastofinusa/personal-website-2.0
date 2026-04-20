import { parseDOB } from "dobx"

const dob = parseDOB("01/09/2003")

export const AboutIntro = () => {
  return (
    <div>
      I&apos;m a <strong>{dob.age}</strong> years old Web3 Frontend Engineer
    </div>
  )
}
