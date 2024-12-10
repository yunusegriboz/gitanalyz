#!/usr/bin/env node

const { spawn } = require("child_process");

function getTotalCommits(callback) {
  const gitLog = spawn("git", ["log", "--pretty=format:%ae %an"]);

  let stdout = '';
  let stderr = '';

  gitLog.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  gitLog.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  gitLog.on('close', (code) => {
    if (code !== 0) {
      console.error(`Git log error: ${stderr}`);
      return;
    }

    const commitData = stdout.split("\n");
    const commitStats = {};

    commitData.forEach((entry) => {
      const [email, ...authorName] = entry.split(' ');
      if (!email || !authorName.length) return;

      const cleanEmail = email.replace(/^['"]|['"]$/g, '').trim();
      const cleanAuthor = authorName.join(' ').replace(/^['"]|['"]$/g, '').trim();

      if (!commitStats[cleanEmail]) {
        commitStats[cleanEmail] = { name: cleanAuthor, commits: 0 };
      }
      commitStats[cleanEmail].commits += 1;
    });

    callback(commitStats);
  });
}

function allcommits(callback){
  const gitLog = spawn("git", [
    "log",
    "--pretty=format:%h|%ae|%ad|%s",
    "--date=short"
  ]);

  let stdout = '';

  gitLog.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  gitLog.on("close", () => {
    const commits = stdout
      .split("\n")
      .filter(line => line)
      .map(line => {
        const [commitHash, authorEmail, commitDate, ...commitMessageParts] = line.split("|");
        const commitMessage = commitMessageParts.join("|"); // "|" işaretlerini işler
        return { commitHash, authorEmail, commitDate, commitMessage };
      });

    callback(commits);
  });
}

function getLastCommitsForAuthor(authorEmail, numCommits, callback) {
  const gitLog = spawn("git", [
    "log",
    `--author=${authorEmail}`,
    "--pretty=format:%h|%ad|%s",
    "--date=short",
    `-n ${numCommits}`
  ]);

  let stdout = '';
  let stderr = '';

  gitLog.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  gitLog.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  gitLog.on('close', (code) => {
    if (code !== 0) {
      console.error(`Git log error: ${stderr}`);
      return;
    }

    const commits = stdout
      .split("\n")
      .filter(line => line)
      .map(line => {
        const [commitId, commitDate, commitMessage] = line.split("|");
        return { commitId, commitDate, commitMessage };
      });

    callback(commits);
  });
}

function getAllCommitsForAuthor(authorEmail, callback) {
  const gitLog = spawn("git", [
    "log",
    `--author=${authorEmail}`,
    "--pretty=format:%h|%ad|%s",
    "--date=short"
  ]);

  let stdout = '';
  let stderr = '';

  gitLog.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  gitLog.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  gitLog.on('close', (code) => {
    if (code !== 0) {
      console.error(`Git log error: ${stderr}`);
      return;
    }

    const commits = stdout
      .split("\n")
      .filter(line => line)
      .map(line => {
        const [commitId, commitDate, commitMessage] = line.split("|");
        return { commitId, commitDate, commitMessage };
      });

    callback(commits);
  });
}

function getprojectmembers(callback) {
  getTotalCommits((commitStats) => {
    const projectMembers = Object.entries(commitStats)
      .map(([email, stats]) => ({ name: stats.name, email }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log("Project Members:");
    console.log("----------------");
    projectMembers.forEach((member, index) => {
      console.log(`${index + 1}- ${member.name} - ${member.email}`);
    });
    console.log("----------------");

    callback();
  });
}

function getContributionReport() {
  getTotalCommits((commitStats) => {
    const sortedCommits = Object.entries(commitStats)
      .sort(([, a], [, b]) => b.commits - a.commits);

    console.log("Contribution Report:");
    console.log("--------------------");
    sortedCommits.forEach(([email, stats], index) => {
      console.log(`${index + 1}- ${stats.name} (${email}): ${stats.commits} commits`);
    });
    console.log("--------------------");
  });
}

function printHelp() {
  console.log("Usage:");
  console.log("------");
  console.log("  gitanalyz                     	 - List project members and their contributions.");
  console.log("  gitanalyz allcommits          	 - List all commits.");
  console.log("  gitanalyz <author_email>      	 - List all commits by the specified author.");
  console.log("  gitanalyz <author_email> last <number> - List the last N commits by the specified author.");
  console.log("  gitanalyz -help               	 - Display this help message.");
  console.log("-------");
}

function printAllCommits() {
  allcommits((commits) => {
    console.log("All Commits:");
    console.log("------------");
    commits.forEach(commit => {
      console.log(
        `${commit.commitHash} - ${commit.commitDate} - ${commit.authorEmail} - ${commit.commitMessage}`
      );
    });
    console.log("------------");
  });
}

function handleCommandLineArgs() {
  const args = process.argv.slice(2);

  if (args[0] === "-help") {
    printHelp();
    return;
  }

  if (args[0] === "allcommits") {
	printAllCommits();
    return;
  }

  const authorEmail = args[0];
  const lastCount = args[2];

  if (args.length === 0) {
    getprojectmembers(() => {
      getContributionReport();
    });
  } else if (args.length >= 1) {
    getTotalCommits((commitStats) => {
      if (!commitStats[authorEmail]) {
        console.log(`No user found with the email "${authorEmail}".`);
        return;
      }

      if (args.length === 3 && args[1] === "last" && !isNaN(lastCount)) {
        getLastCommitsForAuthor(authorEmail, parseInt(lastCount), (commits) => {
          console.log(`Last ${lastCount} commits of ${authorEmail}:`);
          console.log("-----");
          commits.forEach((commit, index) => {
            const { commitId, commitDate, commitMessage } = commit;
            console.log(`${index + 1}- ${commitId} - ${commitDate} - ${commitMessage}`);
          });
          console.log("-----");
        });
      } else if (args.length === 1) {
        getAllCommitsForAuthor(authorEmail, (commits) => {
          console.log(`All commits of ${authorEmail}:`);
          console.log("-----");
          commits.forEach((commit, index) => {
            const { commitId, commitDate, commitMessage } = commit;
            console.log(`${index + 1}- ${commitId} - ${commitDate} - ${commitMessage}`);
          });
          console.log("-----");
        });
      } else {
        console.log("Invalid command. Use 'gitanalyz -help' for a list of valid commands.");
      }
    });
  }
}

handleCommandLineArgs();
