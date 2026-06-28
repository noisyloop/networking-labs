/* ===========================================================================
 * DATA :: LABS
 * ========================================================================= */
export const LABS = [
  /* ---------------- DOMAIN 1 ---------------- */
  {
    id: "L1.1",
    domain: 1,
    title: "Subnet a /24 into 6 usable subnets",
    scenario:
      "You are given 192.168.50.0/24 and must carve it into at least 6 equal subnets, each supporting up to 25 hosts, then assign the first three to LAN segments.",
    diagram:
      "192.168.50.0/24\n        │\n  ┌─────┼─────┬─────┐\n[LAN-A][LAN-B][LAN-C] ... (6 subnets)",
    objective:
      "Choose a prefix that yields ≥6 subnets with ≥25 hosts each, then list each subnet's network, host range and broadcast.",
    explain:
      "Need ≥6 subnets → borrow 3 bits (2^3 = 8 subnets). New prefix = /24 + 3 = /27. A /27 gives 2^5 − 2 = 30 hosts, satisfying the 25-host requirement. Magic number = 256 − 224 = 32, so subnets increment by 32 in the last octet.",
    steps: [
      { desc: "Determine bits to borrow: 2^s ≥ 6 → s=3 → /27 (mask 255.255.255.224).", cmd: "/24 + 3 bits = /27   hosts = 2^5 - 2 = 30   magic = 32" },
      { desc: "Assign LAN-A (subnet 0).", cmd: "interface g0/0\n ip address 192.168.50.1 255.255.255.224" },
      { desc: "Assign LAN-B (subnet 1).", cmd: "interface g0/1\n ip address 192.168.50.33 255.255.255.224" },
      { desc: "Assign LAN-C (subnet 2).", cmd: "interface g0/2\n ip address 192.168.50.65 255.255.255.224" },
    ],
    verify: "show ip interface brief\nshow ip route connected",
    expected:
      "GigabitEthernet0/0  192.168.50.1   up up\nGigabitEthernet0/1  192.168.50.33  up up\nC  192.168.50.0/27 is directly connected, Gig0/0\nC  192.168.50.32/27 is directly connected, Gig0/1",
    mistakes: [
      "Choosing /28 (only 14 hosts) — fails the 25-host requirement.",
      "Forgetting the network and broadcast addresses are unusable (that's why it's 2^h − 2).",
      "Mixing up the magic number (256 − 224 = 32, not 16).",
    ],
  },
  {
    id: "L1.2",
    domain: 1,
    title: "IPv6 EUI-64 address calculation",
    scenario:
      "An interface has MAC 00:1A:2B:3C:4D:5E and is configured for EUI-64 on prefix 2001:db8:acad:1::/64. Derive the full IPv6 address.",
    diagram: "MAC 00:1A:2B:3C:4D:5E  +  prefix 2001:db8:acad:1::/64",
    objective: "Compute the 64-bit interface ID with EUI-64 and write the complete address.",
    explain:
      "EUI-64 expands a 48-bit MAC to 64 bits: split the MAC, insert FFFE in the middle, then flip the 7th bit (U/L bit) of the first byte. 0x00 → 0x02. Result interface ID = 021A:2BFF:FE3C:4D5E.",
    steps: [
      { desc: "Split MAC into two halves.", cmd: "00:1A:2B  |  3C:4D:5E" },
      { desc: "Insert FFFE in the middle.", cmd: "00:1A:2B:FF:FE:3C:4D:5E" },
      { desc: "Flip the 7th bit of the first byte (00000000 → 00000010 = 02).", cmd: "02:1A:2B:FF:FE:3C:4D:5E  →  021A:2BFF:FE3C:4D5E" },
      { desc: "Configure EUI-64 and let IOS build it.", cmd: "interface g0/0\n ipv6 address 2001:db8:acad:1::/64 eui-64" },
    ],
    verify: "show ipv6 interface g0/0",
    expected:
      "IPv6 is enabled, link-local address is FE80::21A:2BFF:FE3C:4D5E\n  Global unicast address: 2001:DB8:ACAD:1:21A:2BFF:FE3C:4D5E",
    mistakes: [
      "Forgetting to flip the 7th bit — this is the most common error.",
      "Inserting FFFF instead of FFFE.",
      "Flipping a bit in the wrong byte (it's always the first byte).",
    ],
  },
  {
    id: "L1.3",
    domain: 1,
    title: "TCP 3-way handshake analysis",
    scenario:
      "A host opens an HTTPS session to 203.0.113.10. Capture and interpret the handshake flags and sequence numbers.",
    diagram:
      "Client 10.0.0.5        Server 203.0.113.10:443\n   │── SYN ───────────────▶│\n   │◀── SYN, ACK ──────────│\n   │── ACK ───────────────▶│  (established)",
    objective: "Identify the flags, the seq/ack relationship, and confirm the session reaches ESTABLISHED.",
    explain:
      "TCP establishes state before data. SYN carries the client ISN. The server replies SYN+ACK with its own ISN and ack = client ISN+1. The client's final ACK = server ISN+1. Each SYN/FIN consumes one sequence number.",
    steps: [
      { desc: "Generate the session (e.g. open the page) and capture.", cmd: "C:\\> curl https://203.0.113.10" },
      { desc: "Filter the capture for the conversation.", cmd: "tcp.port == 443 && ip.addr == 203.0.113.10" },
      { desc: "Read the three packets' flags.", cmd: "1) [SYN]      seq=0\n2) [SYN,ACK]  seq=0 ack=1\n3) [ACK]      seq=1 ack=1" },
    ],
    verify: "netstat -ano | findstr :443",
    expected: "TCP  10.0.0.5:51544  203.0.113.10:443  ESTABLISHED",
    mistakes: [
      "Confusing the half-open SYN_SENT state with ESTABLISHED.",
      "Expecting data in the handshake — payload starts after the third packet.",
      "Thinking teardown is also 3 packets (it's a 4-way FIN exchange).",
    ],
  },

  /* ---------------- DOMAIN 2 ---------------- */
  {
    id: "L2.1",
    domain: 2,
    title: "VLAN + 802.1Q trunk on a 2-switch topology",
    scenario:
      "Two switches connect via Gi0/1. SALES (VLAN 10) and ENG (VLAN 20) hosts exist on both. Build the VLANs and a trunk so each VLAN spans both switches.",
    diagram:
      "[PC-Sales]─fa0/2  SW1  g0/1═══trunk═══g0/1  SW2  fa0/2─[PC-Eng]\n[PC-Eng]──fa0/3                              fa0/3─[PC-Sales]",
    objective: "Create VLANs 10/20 on both switches, assign access ports, and form an 802.1Q trunk carrying both VLANs.",
    explain:
      "Access ports place a host in a single VLAN. The inter-switch link must be a trunk so it can carry tagged frames for multiple VLANs. 802.1Q tags every VLAN except the native VLAN.",
    steps: [
      { desc: "On both switches, create the VLANs.", cmd: "vlan 10\n name SALES\nvlan 20\n name ENG" },
      { desc: "Assign access ports (example SW1).", cmd: "interface fa0/2\n switchport mode access\n switchport access vlan 10\ninterface fa0/3\n switchport mode access\n switchport access vlan 20" },
      { desc: "Configure the trunk on both ends.", cmd: "interface g0/1\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan 10,20" },
    ],
    verify: "show vlan brief\nshow interfaces trunk",
    expected:
      "Port    Mode  Encapsulation  Status   Native vlan\nGi0/1   on    802.1q         trunking 1\nVlans allowed and active in management domain: 10,20",
    mistakes: [
      "Leaving the inter-switch link as an access port — only one VLAN would pass.",
      "Native VLAN mismatch between the two ends (CDP will warn).",
      "Pruning VLAN 10/20 off the allowed list by accident.",
    ],
  },
  {
    id: "L2.2",
    domain: 2,
    title: "RSTP root bridge manipulation",
    scenario:
      "Three switches form a triangle. The election made SW3 (oldest MAC) the root, causing suboptimal paths. Force SW1 to become root and SW2 to be the backup.",
    diagram:
      "        [SW1]\n        /    \\\n     [SW2]──[SW3]\n  goal: SW1 = root, SW2 = secondary",
    objective: "Use priority to make SW1 the root bridge for VLAN 1 and SW2 the secondary, verify port roles.",
    explain:
      "The lowest Bridge ID wins root. Bridge ID = priority + extended system ID (VLAN) + MAC. Since MAC is fixed, lower the priority on SW1 (multiples of 4096). 'root primary' sets 24576; 'root secondary' sets 28672.",
    steps: [
      { desc: "Ensure Rapid-PVST is running.", cmd: "spanning-tree mode rapid-pvst" },
      { desc: "Make SW1 the root for VLAN 1.", cmd: "SW1(config)# spanning-tree vlan 1 priority 4096" },
      { desc: "Make SW2 the secondary root.", cmd: "SW2(config)# spanning-tree vlan 1 priority 8192" },
    ],
    verify: "show spanning-tree vlan 1",
    expected:
      "SW1: This bridge is the root\n  Root ID Priority 4097\nSW3: Root port Gi0/1 (toward SW1), one Alternate (BLK) port",
    mistakes: [
      "Using a priority that isn't a multiple of 4096 (rejected by IOS).",
      "Forgetting the extended system ID adds the VLAN number (4096+1 = 4097).",
      "Changing priority on only one VLAN when PVST runs an instance per VLAN.",
    ],
  },
  {
    id: "L2.3",
    domain: 2,
    title: "EtherChannel LACP setup",
    scenario:
      "SW1 and SW2 are linked by Gi0/1 and Gi0/2. Bundle them into one logical 2-Gbps trunk using LACP to remove STP blocking and add redundancy.",
    diagram:
      "[SW1] g0/1 ═╗\n            ╠══ Po1 (LACP) ══ [SW2]\n      g0/2 ═╝",
    objective: "Create a Layer-2 EtherChannel with LACP (active/active), then trunk the port-channel.",
    explain:
      "EtherChannel aggregates links so STP sees a single logical port — no blocking, full bandwidth. LACP (802.3ad) negotiates the bundle; both ends must be active or active+passive. Member ports must share speed, duplex and VLAN settings.",
    steps: [
      { desc: "On SW1, add both members to channel-group 1 (active = LACP).", cmd: "interface range g0/1 - 2\n channel-group 1 mode active" },
      { desc: "Repeat identically on SW2.", cmd: "interface range g0/1 - 2\n channel-group 1 mode active" },
      { desc: "Configure the logical interface as a trunk.", cmd: "interface port-channel 1\n switchport mode trunk\n switchport trunk allowed vlan 10,20" },
    ],
    verify: "show etherchannel summary\nshow lacp neighbor",
    expected:
      "Group  Port-channel  Protocol   Ports\n1      Po1(SU)       LACP       Gi0/1(P) Gi0/2(P)\n(SU = Layer2, in use ; P = bundled)",
    mistakes: [
      "Setting one side 'active' and the other 'on' — mode mismatch, bundle fails.",
      "Mismatched allowed VLANs / duplex on member ports (ports go suspended).",
      "Configuring switchport settings on members instead of on Port-channel 1.",
    ],
  },

  /* ---------------- DOMAIN 3 ---------------- */
  {
    id: "L3.1",
    domain: 3,
    title: "OSPF multi-area configuration",
    scenario:
      "R1 (area 0) connects to R2, which is an ABR into area 1 where R3 lives. Bring up OSPF so all loopbacks are reachable end to end.",
    diagram:
      "[R1]──area 0──[R2 ABR]──area 1──[R3]\n 1.1.1.1       2.2.2.2        3.3.3.3",
    objective: "Configure OSPFv2 across two areas, set router-IDs, and confirm inter-area (O IA) routes appear.",
    explain:
      "OSPF areas reduce LSA flooding. Every non-backbone area must connect to area 0; R2 is the ABR joining area 0 and area 1, generating Type-3 summary LSAs so R1 learns area 1 routes as O IA.",
    steps: [
      { desc: "R1 in area 0.", cmd: "router ospf 1\n router-id 1.1.1.1\n network 10.0.12.0 0.0.0.3 area 0\n network 1.1.1.1 0.0.0.0 area 0" },
      { desc: "R2 is the ABR (both areas).", cmd: "router ospf 1\n router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3 area 0\n network 10.0.23.0 0.0.0.3 area 1" },
      { desc: "R3 in area 1.", cmd: "router ospf 1\n router-id 3.3.3.3\n network 10.0.23.0 0.0.0.3 area 1\n network 3.3.3.3 0.0.0.0 area 1" },
    ],
    verify: "show ip ospf neighbor\nshow ip route ospf",
    expected:
      "Neighbor ID  State    Interface\n2.2.2.2      FULL/DR  Gig0/0\nO IA  3.3.3.3/32 [110/2] via 10.0.12.2",
    mistakes: [
      "Putting a non-zero area not adjacent to area 0 (discontiguous area).",
      "Wildcard mask errors in network statements (it's inverse mask, not subnet mask).",
      "MTU/timer mismatch leaving neighbors stuck in EXSTART/EXCHANGE.",
    ],
  },
  {
    id: "L3.2",
    domain: 3,
    title: "Floating static route failover",
    scenario:
      "R1 reaches 10.20.0.0/24 primarily via the MPLS link (next-hop .2) and must fail over to a backup Internet link (next-hop .6) only when MPLS drops.",
    diagram:
      "          ┌─ MPLS (.2)  primary  AD 1 ─┐\n[R1]──────┤                              ├──▶ 10.20.0.0/24\n          └─ INET (.6)  backup   AD 5 ──┘",
    objective: "Install a primary static route and a floating static backup with a higher AD.",
    explain:
      "Two static routes to the same prefix: the lower-AD route is active. The backup gets a higher AD (e.g. 5), so it stays out of the routing table until the primary's next-hop/interface becomes unreachable, then it 'floats' in.",
    steps: [
      { desc: "Primary static (default AD 1).", cmd: "ip route 10.20.0.0 255.255.255.0 192.168.1.2" },
      { desc: "Floating backup (AD 5).", cmd: "ip route 10.20.0.0 255.255.255.0 192.168.1.6 5" },
      { desc: "Test failover by shutting the primary path.", cmd: "interface g0/0\n shutdown" },
    ],
    verify: "show ip route 10.20.0.0\nshow ip route 10.20.0.0   (after shutdown)",
    expected:
      "Before: S 10.20.0.0/24 [1/0] via 192.168.1.2\nAfter : S 10.20.0.0/24 [5/0] via 192.168.1.6",
    mistakes: [
      "Giving the backup the same AD — load-shares instead of failing over.",
      "Pointing the backup out the same interface/next-hop as the primary.",
      "Expecting failover when only the remote end fails but the local link stays up (use IP SLA tracking).",
    ],
  },
  {
    id: "L3.3",
    domain: 3,
    title: "HSRP active/standby gateway",
    scenario:
      "VLAN 10 hosts need a redundant default gateway 10.0.10.1. R1 should be active (priority 110, preempt) and R2 the standby.",
    diagram:
      "[R1 pri 110]─┐            VIP 10.0.10.1\n             ├── VLAN10 hosts → gw .1\n[R2 pri 100]─┘",
    objective: "Configure HSRP group 1 with a virtual IP, set R1 priority + preempt, verify states.",
    explain:
      "HSRP presents one virtual IP/MAC as the gateway. The higher-priority router is Active; preempt lets a recovered higher-priority router reclaim Active (off by default). Hosts always point at the VIP, so failover is transparent.",
    steps: [
      { desc: "R1 — active with preempt.", cmd: "interface vlan 10\n ip address 10.0.10.2 255.255.255.0\n standby 1 ip 10.0.10.1\n standby 1 priority 110\n standby 1 preempt" },
      { desc: "R2 — standby (default priority 100).", cmd: "interface vlan 10\n ip address 10.0.10.3 255.255.255.0\n standby 1 ip 10.0.10.1" },
      { desc: "Optionally track an uplink to decrement priority.", cmd: "standby 1 track g0/1 20" },
    ],
    verify: "show standby brief",
    expected:
      "Interface Grp Pri P State   Active     Standby    Virtual IP\nVl10      1   110 P Active  local      10.0.10.3  10.0.10.1\n(R2 shows State = Standby)",
    mistakes: [
      "Forgetting 'preempt' on R1 — R2 keeps Active after R1 recovers.",
      "Different group numbers on the two routers (they never pair).",
      "Hosts using a router's real IP as gateway instead of the VIP.",
    ],
  },

  /* ---------------- DOMAIN 4 ---------------- */
  {
    id: "L4.1",
    domain: 4,
    title: "DHCP server + relay agent",
    scenario:
      "The DHCP server pool lives on R1. Clients on R2's VLAN 30 (different subnet) must get addresses via a relay agent.",
    diagram:
      "[Clients VLAN30]──[R2 relay]───────[R1 DHCP server]\n  10.0.30.0/24   ip helper        pool LAN30",
    objective: "Build a DHCP pool on R1 and configure R2's SVI as a relay (ip helper-address) so remote clients lease addresses.",
    explain:
      "DHCP Discover/Request are broadcasts that routers don't forward. The relay agent (ip helper-address) converts them to unicast toward the server and stamps the giaddr so the server picks the right pool.",
    steps: [
      { desc: "On R1, exclude infra IPs and define the pool.", cmd: "ip dhcp excluded-address 10.0.30.1 10.0.30.10\nip dhcp pool LAN30\n network 10.0.30.0 255.255.255.0\n default-router 10.0.30.1\n dns-server 8.8.8.8" },
      { desc: "On R2, point the client SVI at the server.", cmd: "interface vlan 30\n ip address 10.0.30.1 255.255.255.0\n ip helper-address 10.0.250.1" },
      { desc: "Ensure R1 has a route back to 10.0.30.0/24.", cmd: "ip route 10.0.30.0 255.255.255.0 10.0.250.2" },
    ],
    verify: "show ip dhcp binding\nshow ip dhcp pool",
    expected:
      "IP address    Client-ID/Hardware  Lease expiration\n10.0.30.11    0100.1a2b.3c4d.5e   <date>\nPool LAN30: 1 leased / 244 available",
    mistakes: [
      "Forgetting the helper address — clients fall back to APIPA (169.254.x.x).",
      "No return route on the server to the client subnet.",
      "Not excluding the gateway/static addresses, causing IP conflicts.",
    ],
  },
  {
    id: "L4.2",
    domain: 4,
    title: "PAT (NAT overload) with verification",
    scenario:
      "A 10.0.0.0/24 LAN must reach the Internet through R1's single public interface using PAT.",
    diagram:
      "[LAN 10.0.0.0/24]──g0/0(inside)  R1  g0/1(outside) ──▶ Internet\n                    many hosts → one public IP",
    objective: "Configure PAT so all inside hosts share the outside interface IP, then verify translations.",
    explain:
      "PAT overloads one public IP by tracking unique source ports per session. An ACL identifies inside traffic; 'overload' enables port translation; interfaces are tagged inside/outside.",
    steps: [
      { desc: "Define the inside source ACL.", cmd: "access-list 1 permit 10.0.0.0 0.0.0.255" },
      { desc: "Enable PAT on the outside interface.", cmd: "ip nat inside source list 1 interface g0/1 overload" },
      { desc: "Tag the interfaces.", cmd: "interface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside" },
    ],
    verify: "show ip nat translations\nshow ip nat statistics",
    expected:
      "Pro Inside global       Inside local     Outside global\ntcp 203.0.113.1:1024  10.0.0.5:51000   93.184.216.34:443\ntcp 203.0.113.1:1025  10.0.0.6:50992   93.184.216.34:443",
    mistakes: [
      "Omitting 'overload' — only one host can translate at a time (dynamic NAT).",
      "Swapping inside/outside interface designations.",
      "ACL matching the wrong subnet, so traffic is never translated.",
    ],
  },
  {
    id: "L4.3",
    domain: 4,
    title: "NTP hierarchy setup",
    scenario:
      "R1 syncs to an external time source and serves time to R2 and the switches, establishing a stratum hierarchy.",
    diagram:
      "[Internet NTP s1]──[R1 s2]──[R2 s3]──[SW s4]",
    objective: "Configure R1 as an NTP client/server and R2 as a client of R1; verify stratum and sync.",
    explain:
      "NTP forms a tree by stratum (hops from the reference clock). R1 syncs upstream (becoming stratum 2 if the source is stratum 1) and serves R2, which becomes stratum 3. Accurate clocks matter for logs, certificates and troubleshooting.",
    steps: [
      { desc: "R1 syncs to the upstream source.", cmd: "R1(config)# ntp server 129.6.15.28" },
      { desc: "R2 syncs to R1.", cmd: "R2(config)# ntp server 10.0.12.1" },
      { desc: "Optionally authenticate.", cmd: "ntp authenticate\nntp authentication-key 1 md5 S3cret\nntp trusted-key 1" },
    ],
    verify: "show ntp status\nshow ntp associations",
    expected:
      "R1: Clock is synchronized, stratum 2, reference 129.6.15.28\nR2: Clock is synchronized, stratum 3, reference 10.0.12.1\n* master (sys peer)",
    mistakes: [
      "Reading 'stratum 16' as synced — 16 means unsynchronized.",
      "Forgetting it can take several minutes for associations to reach sync.",
      "Time zone vs UTC confusion (set 'clock timezone' separately).",
    ],
  },

  /* ---------------- DOMAIN 5 ---------------- */
  {
    id: "L5.1",
    domain: 5,
    title: "Extended ACL for traffic filtering",
    scenario:
      "Permit the 10.0.10.0/24 LAN to reach web (HTTP/HTTPS) and DNS, deny it from the 10.0.99.0/24 server VLAN, and allow everything else out.",
    diagram:
      "[LAN 10.0.10.0/24]──R1 g0/0(in)──▶ [web/dns OK]  ✗[10.0.99.0/24]",
    objective: "Write a named extended ACL and apply it inbound on the LAN interface (close to source).",
    explain:
      "Extended ACLs match source, destination, protocol and port, so they belong close to the source to drop unwanted traffic early. Order matters (top-down, first match wins) and there is an implicit deny at the end.",
    steps: [
      { desc: "Build the named extended ACL.", cmd: "ip access-list extended LAN10_OUT\n deny ip 10.0.10.0 0.0.0.255 10.0.99.0 0.0.0.255\n permit tcp 10.0.10.0 0.0.0.255 any eq 80\n permit tcp 10.0.10.0 0.0.0.255 any eq 443\n permit udp 10.0.10.0 0.0.0.255 any eq 53\n permit ip 10.0.10.0 0.0.0.255 any" },
      { desc: "Apply it inbound on the LAN side.", cmd: "interface g0/0\n ip access-group LAN10_OUT in" },
    ],
    verify: "show access-lists LAN10_OUT\nshow ip interface g0/0",
    expected:
      "Extended IP access list LAN10_OUT\n 10 deny ip 10.0.10.0 ... 10.0.99.0 ... (24 matches)\n 20 permit tcp 10.0.10.0 ... eq www (812 matches)\nInbound access list is LAN10_OUT",
    mistakes: [
      "Placing the 'permit ip ... any' before the deny — the deny never triggers.",
      "Applying the extended ACL near the destination instead of the source.",
      "Forgetting DNS uses UDP/53 (and sometimes TCP/53).",
    ],
  },
  {
    id: "L5.2",
    domain: 5,
    title: "Port security with sticky MACs",
    scenario:
      "Access port fa0/5 should allow only the first learned device, remember it across reboots, and shut down on violation.",
    diagram: "[Authorized PC]──fa0/5  SW  ✗ rogue hub/switch blocked",
    objective: "Enable port security with sticky learning, max 1 MAC, and shutdown violation mode; verify.",
    explain:
      "Sticky MAC dynamically learns the connected device's MAC and writes it into running-config, so it survives reloads once saved. Shutdown mode err-disables the port on violation, the most secure option.",
    steps: [
      { desc: "Make the port a static access port.", cmd: "interface fa0/5\n switchport mode access\n switchport access vlan 10" },
      { desc: "Enable port security with sticky learning.", cmd: " switchport port-security\n switchport port-security maximum 1\n switchport port-security mac-address sticky\n switchport port-security violation shutdown" },
      { desc: "Recover an err-disabled port if it trips.", cmd: "interface fa0/5\n shutdown\n no shutdown" },
    ],
    verify: "show port-security interface fa0/5\nshow port-security address",
    expected:
      "Port Security        : Enabled\nViolation Mode       : Shutdown\nMaximum MAC Addresses: 1\nSticky MAC Addresses : 1   (0011.2233.4455 VLAN 10)",
    mistakes: [
      "Leaving the port in dynamic/trunk mode — port-security needs a static access (or trunk) port.",
      "Forgetting to 'write memory', so sticky entries are lost on reload.",
      "Not knowing a shutdown violation requires manual (or errdisable recovery) to restore.",
    ],
  },
  {
    id: "L5.3",
    domain: 5,
    title: "SSH hardening checklist",
    scenario:
      "Replace Telnet with SSHv2 on R1: create a local admin, generate keys, restrict VTY lines, and add a banner.",
    diagram: "[Admin]──SSH(22, encrypted)──▶ R1   ✗ Telnet(23) denied",
    objective: "Harden remote management to SSHv2-only with local authentication and a login banner.",
    explain:
      "SSH encrypts the management session, unlike Telnet. SSH requires a hostname, a domain name (to name the RSA key), an RSA key of at least 1024 bits (768 won't allow v2), and a login method. Restricting VTY 'transport input ssh' disables Telnet.",
    steps: [
      { desc: "Set identity and a local user.", cmd: "hostname R1\nip domain-name lab.local\nusername admin privilege 15 secret S3cret!" },
      { desc: "Generate keys and force SSHv2.", cmd: "crypto key generate rsa modulus 2048\nip ssh version 2" },
      { desc: "Lock the VTY lines to SSH with local login.", cmd: "line vty 0 4\n transport input ssh\n login local\n exec-timeout 5 0" },
      { desc: "Add a legal banner and protect privileged mode.", cmd: "enable secret S3cret!\nservice password-encryption\nbanner motd #Authorized access only#" },
    ],
    verify: "show ip ssh\nshow ssh",
    expected:
      "SSH Enabled - version 2.0\nAuthentication timeout: 120 secs; Authentication retries: 3\nConnection Version Encryption  State        Username\n0          2.0     aes256-ctr   Session started admin",
    mistakes: [
      "Skipping 'ip domain-name' — RSA key generation fails.",
      "Using a 512/768-bit modulus, which can't support SSHv2.",
      "Leaving 'transport input all/telnet', so Telnet still works.",
    ],
  },

  /* ---------------- DOMAIN 6 ---------------- */
  {
    id: "L6.1",
    domain: 6,
    title: "REST API GET request walkthrough",
    scenario:
      "Authenticate to a controller's REST API over HTTPS, request a token, then GET the device inventory and parse the JSON.",
    diagram: "[Client/curl]──HTTPS 443──▶ [Controller REST API] → JSON",
    objective: "Perform token auth (POST) then a resource read (GET), and interpret status codes + JSON.",
    explain:
      "REST is stateless: each call carries auth (here a token from the auth endpoint). GET reads a resource and returns 200 with a JSON body. The client parses keys to extract values — no CLI scraping.",
    steps: [
      { desc: "Request an auth token (POST with Basic auth).", cmd: "curl -k -X POST https://dnac/dna/system/api/v1/auth/token \\\n  -u admin:S3cret!" },
      { desc: "Use the token to GET network devices.", cmd: "curl -k -X GET https://dnac/dna/intent/api/v1/network-device \\\n  -H \"X-Auth-Token: <TOKEN>\" -H \"Accept: application/json\"" },
      { desc: "Read the JSON response body.", cmd: '{ "response": [ { "hostname": "R1",\n  "managementIpAddress": "10.0.0.1",\n  "softwareVersion": "17.6" } ] }' },
    ],
    verify: "echo $?   # curl exit status; inspect HTTP status header",
    expected:
      "HTTP/1.1 200 OK\nContent-Type: application/json\n(401 Unauthorized would mean a bad/expired token)",
    mistakes: [
      "Reusing an expired token (401) — re-auth to refresh it.",
      "Sending GET to a POST-only endpoint (405 Method Not Allowed).",
      "Forgetting the Accept/Content-Type headers, getting XML or an error.",
    ],
  },
  {
    id: "L6.2",
    domain: 6,
    title: "Ansible playbook for interface config",
    scenario:
      "Use an agentless Ansible playbook to push an interface description and 'no shutdown' to a group of IOS switches defined in inventory.",
    diagram: "[Ansible control node]──SSH──▶ [switches group] (idempotent)",
    objective: "Read an inventory, target a host group, and apply IOS config with the ios_config module.",
    explain:
      "Ansible is agentless and connects over SSH. The inventory lists hosts/groups; a playbook maps tasks (modules) to those hosts. ios_config is idempotent — re-running it makes no change if the device already matches.",
    steps: [
      { desc: "Define the inventory.", cmd: "# inventory.ini\n[switches]\nsw1 ansible_host=10.0.0.11\nsw2 ansible_host=10.0.0.12\n\n[switches:vars]\nansible_network_os=ios\nansible_connection=network_cli" },
      { desc: "Write the playbook.", cmd: "- name: Configure access interface\n  hosts: switches\n  gather_facts: no\n  tasks:\n    - name: set description + enable\n      ios_config:\n        parents: interface Gi0/1\n        lines:\n          - description USER-ACCESS\n          - no shutdown" },
      { desc: "Run it.", cmd: "ansible-playbook -i inventory.ini intf.yml" },
    ],
    verify: "ansible switches -i inventory.ini -m ios_command -a \"commands='show run interface Gi0/1'\"",
    expected:
      "PLAY [Configure access interface]\nTASK [set description + enable] changed: [sw1]\nchanged: [sw2]\nPLAY RECAP  sw1 : ok=1 changed=1   sw2 : ok=1 changed=1",
    mistakes: [
      "Bad YAML indentation (YAML is whitespace-sensitive — spaces, never tabs).",
      "Wrong ansible_network_os/connection for network devices.",
      "Expecting 'changed' every run — idempotent tasks report 'ok' when already compliant.",
    ],
  },
  {
    id: "L6.3",
    domain: 6,
    title: "NETCONF get-config example",
    scenario:
      "Enable NETCONF on an IOS-XE device and retrieve the running interface configuration as XML over SSH port 830.",
    diagram: "[Client (ncclient)]──NETCONF/SSH 830──▶ [IOS-XE] → XML",
    objective: "Turn on NETCONF, open a session, and issue a <get-config> filtered to interfaces.",
    explain:
      "NETCONF is a model-driven protocol (YANG data models) running over SSH port 830 with XML payloads and transactional edits. <get-config> reads a datastore (running); a subtree filter narrows the result to interfaces.",
    steps: [
      { desc: "Enable the NETCONF server on the device.", cmd: "Device(config)# netconf-yang" },
      { desc: "Send a get-config with an interface filter.", cmd: "<rpc message-id=\"1\">\n <get-config>\n  <source><running/></source>\n  <filter>\n   <interfaces xmlns=\"urn:ietf:params:xml:ns:yang:ietf-interfaces\"/>\n  </filter>\n </get-config>\n</rpc>" },
      { desc: "Example with Python ncclient.", cmd: "from ncclient import manager\nm = manager.connect(host='10.0.0.1', port=830,\n  username='admin', password='S3cret!', hostkey_verify=False)\nprint(m.get_config(source='running').data_xml)" },
    ],
    verify: "show platform software yang-management process\nshow netconf-yang sessions",
    expected:
      "nesd : Running\nncsshd : Running\nsession-id  transport  username\n  20        netconf-ssh  admin",
    mistakes: [
      "Connecting to port 22 instead of 830.",
      "Forgetting to enable 'netconf-yang' first.",
      "Malformed XML / wrong YANG namespace in the filter.",
    ],
  },
];
