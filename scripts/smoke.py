import argparse
import json
import time
from urllib.error import URLError
from urllib.request import urlopen

parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://127.0.0.1:8000/health")
parser.add_argument("--timeout", type=float, default=30)
args = parser.parse_args()
deadline = time.monotonic() + args.timeout
while True:
    try:
        with urlopen(args.url, timeout=2) as response:
            if response.status != 200 or json.load(response).get("status") != "ok":
                raise ValueError("Unexpected health response")
        print("Health smoke passed")
        break
    except (URLError, TimeoutError, ValueError, OSError):
        if time.monotonic() >= deadline:
            raise SystemExit("Health smoke failed: service unavailable or invalid response")
        time.sleep(0.5)
