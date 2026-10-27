"""Export reviewable change groups without assigning authors or changing the Git index."""

import json
import os
import subprocess
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
groups = json.loads((root / "commit-plan.json").read_text(encoding="utf-8"))
output = root / ".local" / "prepared-commits"
output.mkdir(parents=True, exist_ok=True)

with tempfile.TemporaryDirectory() as temp:
    env = {**os.environ, "GIT_INDEX_FILE": str(Path(temp) / "index")}

    def git(*args):
        return subprocess.check_output(["git", *args], cwd=root, env=env)

    git("read-tree", "HEAD")
    previous = "HEAD"
    for i, group in enumerate(groups, 1):
        git("add", "--", *group["paths"])
        tree = git("write-tree").decode().strip()
        patch = git("diff", "--binary", previous, tree)
        (output / f"{i:02}.patch").write_bytes(patch)
        (output / f"{i:02}.txt").write_text(group["message"] + "\n", encoding="utf-8")
        previous = tree
    remaining = git("diff", "--name-only", previous).decode()
    remaining += git("ls-files", "--others", "--exclude-standard").decode()
    if remaining.strip():
        raise SystemExit(f"Uncovered changes; update commit-plan.json:\n{remaining}")

print(f"Exported {len(groups)} groups to {output}")
