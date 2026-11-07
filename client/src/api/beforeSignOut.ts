type SignOutTask = () => unknown;

const tasks = new Set<SignOutTask>();

/**
 * Runs `task` at the start of every sign-out, while the session can still
 * authorize requests; sign-out waits for any promise it returns. Returns a
 * function that unregisters it.
 */
export const onBeforeSignOut = (task: SignOutTask) => {
  tasks.add(task);
  return () => {
    tasks.delete(task);
  };
};

/** Runs every registered task and waits for them to settle. */
export const runBeforeSignOut = async () => {
  await Promise.allSettled(Array.from(tasks, task => task()));
};
