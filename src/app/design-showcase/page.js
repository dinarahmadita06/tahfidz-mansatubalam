"use client";

import {
  Container,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatsCard,
  FeatureCard,
  Grid,
  Flex,
  Stack,
  Section,
  Heading,
  Text,
  ArabicText,
  Badge,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  Textarea,
  Select,
  SearchInput,
  Divider,
  Spacer,
  LoadingState,
  EmptyState,
} from '@/components/ui-islamic';

import {
  MosqueIcon,
  QuranIcon,
  PrayerIcon,
  KaabaIcon,
  TasbihIcon,
  StarCrescentIcon,
  CalendarIslamicIcon,
  LanternIcon,
  IconContainer,
  FeatureIcon,
  ArabesquePattern,
  GeometricPattern,
  MosqueSilhouette,
} from '@/components/ui-islamic';

import { designSystem } from '@/styles/design-system';
import { Download, Edit, Trash2, Plus, Search } from 'lucide-react';

export default function DesignShowcasePage() {
  return (
    <div style={{ background: designSystem.colors.background.secondary, minHeight: '100vh' }}>
      {/* Page Header */}
      <PageHeader
        title="🕌 Islamic Design System Showcase"
        subtitle="Koleksi lengkap komponen UI dengan desain modern Islami"
        pattern
      />

      <Container size="default">
        {/* Colors Section */}
        <Section background="default" padding="lg">
          <Heading level={2}>Color Palette</Heading>
          <Spacer size="md" />

          <Grid cols={4} gap="md" responsive>
            <div>
              <Text size="sm" weight="semibold">Primary (Gold)</Text>
              <Spacer size="sm" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} style={{
                    background: designSystem.colors.primary[shade],
                    padding: '0.75rem',
                    borderRadius: designSystem.borderRadius.md,
                    color: shade > 500 ? '#fff' : '#000',
                    fontSize: designSystem.typography.fontSize.xs,
                  }}>
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Text size="sm" weight="semibold">Secondary (Cream)</Text>
              <Spacer size="sm" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} style={{
                    background: designSystem.colors.secondary[shade],
                    padding: '0.75rem',
                    borderRadius: designSystem.borderRadius.md,
                    color: shade > 600 ? '#fff' : '#000',
                    fontSize: designSystem.typography.fontSize.xs,
                  }}>
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Text size="sm" weight="semibold">Accent (Terracotta)</Text>
              <Spacer size="sm" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} style={{
                    background: designSystem.colors.accent[shade],
                    padding: '0.75rem',
                    borderRadius: designSystem.borderRadius.md,
                    color: shade > 500 ? '#fff' : '#000',
                    fontSize: designSystem.typography.fontSize.xs,
                  }}>
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Text size="sm" weight="semibold">Semantic Colors</Text>
              <Spacer size="sm" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  background: designSystem.colors.success.DEFAULT,
                  padding: '0.75rem',
                  borderRadius: designSystem.borderRadius.md,
                  color: '#fff',
                  fontSize: designSystem.typography.fontSize.xs,
                }}>
                  Success
                </div>
                <div style={{
                  background: designSystem.colors.warning.DEFAULT,
                  padding: '0.75rem',
                  borderRadius: designSystem.borderRadius.md,
                  color: '#fff',
                  fontSize: designSystem.typography.fontSize.xs,
                }}>
                  Warning
                </div>
                <div style={{
                  background: designSystem.colors.error.DEFAULT,
                  padding: '0.75rem',
                  borderRadius: designSystem.borderRadius.md,
                  color: '#fff',
                  fontSize: designSystem.typography.fontSize.xs,
                }}>
                  Error
                </div>
                <div style={{
                  background: designSystem.colors.info.DEFAULT,
                  padding: '0.75rem',
                  borderRadius: designSystem.borderRadius.md,
                  color: '#fff',
                  fontSize: designSystem.typography.fontSize.xs,
                }}>
                  Info
                </div>
              </div>
            </div>
          </Grid>
        </Section>

        <Spacer size="xl" />

        {/* Typography Section */}
        <Card variant="elevated" padding="lg">
          <Heading level={2}>Typography</Heading>
          <Spacer size="md" />

          <Stack spacing="lg">
            <div>
              <Heading level={1}>Heading 1 - Bold & Large</Heading>
              <Heading level={2}>Heading 2 - Section Title</Heading>
              <Heading level={3}>Heading 3 - Subsection</Heading>
              <Heading level={4}>Heading 4 - Card Title</Heading>
              <Heading level={5}>Heading 5 - Small Title</Heading>
              <Heading level={6}>Heading 6 - Tiny Title</Heading>
            </div>

            <div>
              <Text size="xl" weight="bold">Extra Large Text</Text>
              <Text size="lg">Large Text - Good for emphasis</Text>
              <Text size="base">Base Text - Default paragraph</Text>
              <Text size="sm">Small Text - Captions and labels</Text>
              <Text size="xs">Extra Small - Fine print</Text>
            </div>

            <div>
              <ArabicText size="2xl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </ArabicText>
              <ArabicText size="xl">
                الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
              </ArabicText>
            </div>

            <Heading level={2} variant="gradient">
              Gradient Text Effect
            </Heading>
          </Stack>
        </Card>

        <Spacer size="xl" />

        {/* Buttons Section */}
        <Card variant="cream" padding="lg">
          <Heading level={2}>Buttons</Heading>
          <Spacer size="md" />

          <Stack spacing="lg">
            <div>
              <Text size="sm" weight="semibold" color="secondary">Button Variants</Text>
              <Spacer size="sm" />
              <ButtonGroup spacing="md">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </ButtonGroup>
            </div>

            <div>
              <Text size="sm" weight="semibold" color="secondary">Button Sizes</Text>
              <Spacer size="sm" />
              <Flex align="center" gap="md">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </Flex>
            </div>

            <div>
              <Text size="sm" weight="semibold" color="secondary">Buttons with Icons</Text>
              <Spacer size="sm" />
              <ButtonGroup spacing="md">
                <Button variant="primary" icon={<Plus size={16} />} iconPosition="left">
                  Add New
                </Button>
                <Button variant="secondary" icon={<Download size={16} />} iconPosition="left">
                  Download
                </Button>
                <Button variant="outline" icon={<Search size={16} />} iconPosition="right">
                  Search
                </Button>
              </ButtonGroup>
            </div>

            <div>
              <Text size="sm" weight="semibold" color="secondary">Icon Buttons</Text>
              <Spacer size="sm" />
              <Flex align="center" gap="sm">
                <IconButton icon={<Edit size={16} />} variant="ghost" />
                <IconButton icon={<Trash2 size={16} />} variant="ghost" />
                <IconButton icon={<Download size={16} />} variant="outline" />
                <IconButton icon={<Plus size={16} />} variant="primary" />
              </Flex>
            </div>

            <div>
              <Text size="sm" weight="semibold" color="secondary">Loading State</Text>
              <Spacer size="sm" />
              <Button variant="primary" loading>Loading...</Button>
            </div>
          </Stack>
        </Card>

        <Spacer size="xl" />

        {/* Islamic Icons Section */}
        <Card variant="elevated" padding="lg">
          <Heading level={2}>Islamic Icons</Heading>
          <Spacer size="md" />

          <Grid cols={5} gap="lg" responsive>
            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="gradient" size="lg">
                <MosqueIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Mosque</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="gradient" size="lg">
                <QuranIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Quran</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="gradient" size="lg">
                <PrayerIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Prayer</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="gradient" size="lg">
                <KaabaIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Kaaba</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="gradient" size="lg">
                <TasbihIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Tasbih</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="outlined" size="lg">
                <StarCrescentIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Star & Crescent</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="outlined" size="lg">
                <CalendarIslamicIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Calendar</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IconContainer variant="outlined" size="lg">
                <LanternIcon size="md" />
              </IconContainer>
              <Spacer size="sm" />
              <Text size="xs">Lantern</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <FeatureIcon
                icon={<QuranIcon size="lg" />}
                badge="5"
                size="lg"
              />
              <Spacer size="sm" />
              <Text size="xs">With Badge</Text>
            </div>
          </Grid>
        </Card>

        <Spacer size="xl" />

        {/* Stats Cards */}
        <div>
          <Heading level={2}>Stats Cards</Heading>
          <Spacer size="md" />
          <Grid cols={4} gap="md" responsive>
            <StatsCard
              icon={<QuranIcon size="md" />}
              title="Total Hafalan"
              value="25 Juz"
              trend={15}
            />
            <StatsCard
              icon={<PrayerIcon size="md" />}
              title="Santri Aktif"
              value="150"
              trend={8}
            />
            <StatsCard
              icon={<TasbihIcon size="md" />}
              title="Setoran Hari Ini"
              value="45"
              trend={-5}
            />
            <StatsCard
              icon={<MosqueIcon size="md" />}
              title="Total Kelas"
              value="12"
            />
          </Grid>
        </div>

        <Spacer size="xl" />

        {/* Feature Cards */}
        <div>
          <Heading level={2}>Feature Cards</Heading>
          <Spacer size="md" />
          <Grid cols={3} gap="lg" responsive>
            <FeatureCard
              icon={<QuranIcon size="lg" />}
              title="Buku Digital"
              description="Kelola setoran hafalan santri secara digital"
            />
            <FeatureCard
              icon={<CalendarIslamicIcon size="lg" />}
              title="Jadwal Kelas"
              description="Atur dan pantau jadwal kelas tahfidz"
            />
            <FeatureCard
              icon={<TasbihIcon size="lg" />}
              title="Penilaian"
              description="Sistem penilaian hafalan yang komprehensif"
            />
          </Grid>
        </div>

        <Spacer size="xl" />

        {/* Form Inputs */}
        <Card variant="elevated" padding="lg">
          <Heading level={2}>Form Inputs</Heading>
          <Spacer size="md" />

          <Grid cols={2} gap="lg">
            <div>
              <Input
                label="Nama Santri"
                placeholder="Masukkan nama..."
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                icon={<Search size={16} />}
                iconPosition="left"
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Pilih Kelas"
                options={[
                  { value: '1', label: 'Kelas 1' },
                  { value: '2', label: 'Kelas 2' },
                  { value: '3', label: 'Kelas 3' },
                ]}
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Dengan Error"
                error="Field ini wajib diisi"
                fullWidth
              />
            </div>
          </Grid>

          <Spacer size="md" />

          <Textarea
            label="Catatan"
            placeholder="Tulis catatan di sini..."
            rows={4}
            helperText="Maksimal 500 karakter"
            fullWidth
          />

          <Spacer size="md" />

          <SearchInput
            placeholder="Cari santri..."
            fullWidth
          />
        </Card>

        <Spacer size="xl" />

        {/* Badges */}
        <Card variant="cream" padding="lg">
          <Heading level={2}>Badges</Heading>
          <Spacer size="md" />

          <Stack spacing="md">
            <div>
              <Text size="sm" weight="semibold" color="secondary">Variants</Text>
              <Spacer size="sm" />
              <Flex gap="sm" wrap>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="gradient">Gradient</Badge>
              </Flex>
            </div>

            <div>
              <Text size="sm" weight="semibold" color="secondary">Sizes</Text>
              <Spacer size="sm" />
              <Flex align="center" gap="sm">
                <Badge variant="primary" size="sm">Small</Badge>
                <Badge variant="primary" size="md">Medium</Badge>
                <Badge variant="primary" size="lg">Large</Badge>
              </Flex>
            </div>
          </Stack>
        </Card>

        <Spacer size="xl" />

        {/* Cards */}
        <div>
          <Heading level={2}>Card Variants</Heading>
          <Spacer size="md" />
          <Grid cols={4} gap="md" responsive>
            <Card variant="default" padding="md">
              <Text weight="semibold">Default Card</Text>
              <Text size="sm" color="secondary">White background with border</Text>
            </Card>

            <Card variant="cream" padding="md">
              <Text weight="semibold">Cream Card</Text>
              <Text size="sm" color="secondary">Warm cream background</Text>
            </Card>

            <Card variant="gradient" padding="md">
              <Text weight="semibold" color="inverse">Gradient Card</Text>
              <Text size="sm" color="inverse">Gold gradient background</Text>
            </Card>

            <Card variant="elevated" padding="md" hover>
              <Text weight="semibold">Elevated Card</Text>
              <Text size="sm" color="secondary">With shadow & hover effect</Text>
            </Card>
          </Grid>
        </div>

        <Spacer size="xl" />

        {/* Complex Card Example */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Complex Card Example</CardTitle>
            <CardDescription>
              This card demonstrates all card sub-components working together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <Spacer size="md" />
            <Grid cols={3} gap="md">
              <div style={{
                padding: designSystem.spacing[4],
                background: designSystem.colors.primary[100],
                borderRadius: designSystem.borderRadius.lg,
                textAlign: 'center',
              }}>
                <Text size="2xl" weight="bold" color="primary">150</Text>
                <Text size="xs" color="secondary">Total Items</Text>
              </div>
              <div style={{
                padding: designSystem.spacing[4],
                background: designSystem.colors.success.light,
                borderRadius: designSystem.borderRadius.lg,
                textAlign: 'center',
              }}>
                <Text size="2xl" weight="bold" color="primary">85%</Text>
                <Text size="xs" color="secondary">Completion</Text>
              </div>
              <div style={{
                padding: designSystem.spacing[4],
                background: designSystem.colors.warning.light,
                borderRadius: designSystem.borderRadius.lg,
                textAlign: 'center',
              }}>
                <Text size="2xl" weight="bold" color="primary">12</Text>
                <Text size="xs" color="secondary">Pending</Text>
              </div>
            </Grid>
          </CardContent>
          <CardFooter align="right">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Save Changes</Button>
          </CardFooter>
        </Card>

        <Spacer size="xl" />

        {/* Empty State */}
        <Card variant="cream" padding="lg">
          <EmptyState
            icon={<QuranIcon size="lg" />}
            title="Belum Ada Data"
            description="Belum ada penilaian untuk periode ini. Mulai tambahkan data sekarang."
            action={
              <Button variant="primary" icon={<Plus size={16} />}>
                Tambah Data Baru
              </Button>
            }
          />
        </Card>

        <Spacer size="xl" />

        {/* Islamic Patterns */}
        <Card variant="elevated" padding="lg">
          <Heading level={2}>Islamic Decorative Patterns</Heading>
          <Spacer size="md" />

          <Grid cols={2} gap="lg">
            <div style={{
              position: 'relative',
              height: '200px',
              background: designSystem.colors.background.secondary,
              borderRadius: designSystem.borderRadius.lg,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ArabesquePattern opacity={0.2} />
              <Text weight="semibold" style={{ position: 'relative', zIndex: 1 }}>
                Arabesque Pattern
              </Text>
            </div>

            <div style={{
              position: 'relative',
              height: '200px',
              background: designSystem.colors.background.secondary,
              borderRadius: designSystem.borderRadius.lg,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GeometricPattern opacity={0.2} />
              <Text weight="semibold" style={{ position: 'relative', zIndex: 1 }}>
                Geometric Pattern
              </Text>
            </div>
          </Grid>

          <Spacer size="md" />

          <div style={{
            position: 'relative',
            height: '200px',
            background: designSystem.islamic.gradients.sky,
            borderRadius: designSystem.borderRadius.lg,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: designSystem.spacing[6],
          }}>
            <MosqueSilhouette width="300px" height="120px" />
          </div>
        </Card>

        <Spacer size="2xl" />

        {/* Final Message */}
        <Card variant="gradient" padding="lg" style={{ textAlign: 'center' }}>
          <Heading level={3} style={{ color: designSystem.colors.text.inverse }}>
            ✨ Islamic Modern Design System
          </Heading>
          <Spacer size="sm" />
          <Text color="inverse">
            Dibuat dengan penuh cinta untuk aplikasi tahfidz Al-Quran
          </Text>
          <Spacer size="sm" />
          <Text size="sm" color="inverse">
            Barakallahu fiikum 🤲
          </Text>
        </Card>

        <Spacer size="2xl" />
      </Container>
    </div>
  );
}
