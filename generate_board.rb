puts '<table id="board">'
5.times do |i|
  print "<tr>"
  5.times do |j|
    print "<td id=\"#{j}-#{i}\">"
  end
  puts "</tr>"
end
puts "</table>"
