{
  src,
  stdenv,
  nodejs_24,
}:

stdenv.mkDerivation {
  pname = "opencode-openspec-sidepanel-plugin";
  version = "0.1.0";

  inherit src;

  nativeBuildInputs = [ nodejs_24 ];

  dontBuild = true;

  installPhase = ''
    runHook preInstall
    mkdir -p $out/plugins
    cp -r .opencode/plugins/openspec-stats $out/plugins/
    runHook postInstall
  '';
}
