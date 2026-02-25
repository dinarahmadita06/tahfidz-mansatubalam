/**
 * Family Context Helper
 * Manages multi-child selection for parent accounts
 */

/**
 * Get all siblings for a student (same familyKey)
 * @param {Object} prisma - Prisma client
 * @param {string} siswaId - Student ID
 * @returns {Promise<Array>} Array of sibling students
 */
export async function getSiblings(prisma, siswaId) {
  // Get the student's family key
  const student = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: {
      familyKey: true,
    },
  });

  if (!student || !student.familyKey) {
    return [];
  }

  // Get all students with the same family key
  const siblings = await prisma.siswa.findMany({
    where: {
      familyKey: student.familyKey,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      kelas: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: [
      { statusSiswa: 'asc' }, // AKTIF first
      { createdAt: 'asc' }, // Oldest first (kakak)
    ],
  });

  return siblings;
}

/**
 * Get all children for a parent
 * @param {Object} prisma - Prisma client
 * @param {string} orangTuaId - Parent ID
 * @returns {Promise<Array>} Array of children
 */
export async function getChildrenForParent(prisma, orangTuaId) {
  const relations = await prisma.orangTuaSiswa.findMany({
    where: {
      orangTuaId,
    },
    include: {
      siswa: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          kelas: {
            select: {
              nama: true,
            },
          },
        },
      },
    },
  });

  if (relations.length === 0) {
    return [];
  }

  // Get all siblings using family key of first child
  const firstChild = relations[0].siswa;
  if (!firstChild.familyKey) {
    // Fallback: return only direct children
    return relations.map((r) => r.siswa);
  }

  // Get all children with same family key
  const allChildren = await prisma.siswa.findMany({
    where: {
      familyKey: firstChild.familyKey,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      kelas: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: [
      { statusSiswa: 'asc' }, // AKTIF first
      { createdAt: 'asc' }, // Oldest first
    ],
  });

  return allChildren;
}

/**
 * Get default selected child for parent
 * Priority: First AKTIF child, or first child if none active
 * @param {Array} children - Array of children
 * @returns {Object|null} Selected child
 */
export function getDefaultSelectedChild(children) {
  if (!children || children.length === 0) {
    return null;
  }

  // Try to find first AKTIF child
  const activeChild = children.find((c) => c.statusSiswa === 'AKTIF');
  if (activeChild) {
    return activeChild;
  }

  // Fallback to first child
  return children[0];
}
