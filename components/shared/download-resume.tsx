import { FiDownload } from "react-icons/fi"
import { buttonVariants } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export const DownloadResume = () => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={buttonVariants({
            size: "icon-sm",
            variant: "ghost",
          })}
        >
          <FiDownload />
          <span className="sr-only">Download Resume</span>
        </div>
      </TooltipTrigger>
      <TooltipContent align="end" side="bottom">
        <p className="font-medium">Download Resume</p>
      </TooltipContent>
    </Tooltip>
  )
}
