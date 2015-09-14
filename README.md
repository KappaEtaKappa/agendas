# agendas
Online agendas

# To recreate this service
- cd ~admin
- git clone
- npm install
- cp 'agenda.service' from ./cp to systemd unit folder (Arch: /etc/systemd/system)
- set service to run via systemd (Arch: # systemctl enable agenda.service)

# To edit agenda
- navigate to (delta IP, probably 10.0.0.10)/admin
- edit news, reports, positions
- change ordering method to manually edit values

# notes
- agendas are snapshotted on mondays
- accessed via delta's IP unless a name has been reserved on our router.
