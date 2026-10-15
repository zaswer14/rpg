# Static server for the whole rpg repo (no Node/Python needed).
#   powershell -ExecutionPolicy Bypass -File tools/serve.ps1
# then open http://localhost:8765/   (home page index.html; a server is needed because pages load ../shared/*.js)
param([string]$Root = '', [int]$Port = 8765)
if (-not $Root) { $Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.json'='application/json'; '.png'='image/png'; '.webp'='image/webp'; '.md'='text/plain; charset=utf-8' }
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
  $f = [IO.Path]::GetFullPath((Join-Path $Root $p))
  # Thư mục (kể cả gốc) → index.html của nó, để /vankiep/ hay /platform mở thẳng trang chính.
  if (Test-Path $f -PathType Container) { $c.Response.Redirect('/' + ($p.TrimEnd('/') + '/index.html').TrimStart('/') + $c.Request.Url.Query);$c.Response.Close(); continue }
  if ($f.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $f -PathType Leaf)) {
    $b = [IO.File]::ReadAllBytes($f)
    $ext = [IO.Path]::GetExtension($f).ToLower()
    $c.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
    $c.Response.Headers.Add('Cache-Control', 'no-store')
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
