export function handleError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Your internet did a little disappearing act. Try again in a moment.";
  }

  if (error instanceof SyntaxError) {
    return "We received something that looked like data, but spoke complete nonsense.";
  }

  if (error instanceof Error) {
    return "Something wandered off course. We couldn't finish that request.";
  }

  return "Something went spectacularly sideways. Please try again.";
}

export function handleErrorCode(status: number): string {
  switch (status) {
    case 400:
      return "That request got itself into a bit of a pickle.";

    case 401:
      return "You shall not pass. This request needs some credentials.";

    case 403:
      return "The bouncer said no. You don't have permission to do that.";

    case 404:
      return "We looked everywhere. Absolutely nothing. It's hiding.";

    case 408:
      return "That took too long. The request wandered off for a snack.";

    case 409:
      return "We've got a little disagreement here. The request conflicts with something else.";

    case 422:
      return "The request arrived, but it brought some questionable paperwork.";

    case 429:
      return "Whoa there, turbo. Too many requests. Give the server a breather.";

    case 500:
      return "The server tripped over its own shoelaces.";

    case 502:
      return "The server's middleman appears to have misplaced the memo.";

    case 503:
      return "The server is taking a tiny existential break. Try again shortly.";

    case 504:
      return "The server took the scenic route and missed the deadline.";

    default:
      if (status >= 400 && status < 500) {
        return "The request wasn't quite right. Something got its wires crossed.";
      }

      if (status >= 500) {
        return "The server is having a moment. Try again shortly.";
      }

      return "Something unexpected happened. The machines have questions.";
  }
}
