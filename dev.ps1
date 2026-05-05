param(
  [switch]$WithFrontend,
  [switch]$Watch
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Start-Task {
  param(
    [string]$Name,
    [string]$Command
  )

  Write-Host "Iniciando $Name..."
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $Command -WorkingDirectory $root
}

Start-Task "emuladores" "npm run emulators"

if ($Watch) {
  Start-Task "functions" "npm -w functions run build:watch"
} else {
  Start-Task "functions" "npm -w functions run build"
}

if ($WithFrontend) {
  Start-Task "frontend" "npm -w frontend run dev"
}

Write-Host "Listo. Cierra las ventanas para detener los procesos."
