{ pkgs ? import <nixpkgs> {} }:

let
  nodeVersion = builtins.readFile ./.nvmrc;
  strippedNodeVersion = pkgs.lib.strings.trim nodeVersion;
  nodejsPackage = pkgs."nodejs_${strippedNodeVersion}";

  playright-file = builtins.readFile "${pkgs.playwright-driver}/browsers.json";
  playright-json = builtins.fromJSON playright-file;
  playwright-chromium-entry = builtins.elemAt (builtins.filter (
    browser: browser.name == "chromium"
  ) playright-json.browsers) 0;
  playwright-chromium-revision = playwright-chromium-entry.revision;
in
pkgs.stdenv.mkDerivation {
  name = "node";
  buildInputs = [ 
    nodejsPackage
    pkgs.ffmpeg
    pkgs.xvfb-run
    pkgs.gcc
    pkgs.gnumake
    pkgs.python3
  ];
  nativeBuildInputs = with pkgs; [
    playwright-driver.browsers
  ];
  shellHook = ''
    export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
    export PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH="${pkgs.playwright-driver.browsers}/chromium-${playwright-chromium-revision}/chrome-linux/chrome"
    export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
  '';
}
