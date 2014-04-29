puts '<table id="board">'
5.times do |i|
  print "<tr>"
  5.times do |j|
    print "<td id=\"d#{j.to_s.rjust(2, "0")}-#{i.to_s.rjust(2, "0")}\">"
  end
  puts "</tr>"
end
puts "</table>"
